'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Smile, Paperclip, MoreVertical, Edit2, Trash2, X, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Loader from '@/components/Loader';

interface Channel {
    id: string;
    name: string;
    description?: string | null;
}

interface Message {
    id: string;
    content: string;
    createdAt: string;
    userId: string;
    user: {
        name: string | null;
        email: string | null;
        image: string | null;
    };
    reactions?: {
        id: string;
        emoji: string;
        userId: string;
        user: {
            name: string | null;
        };
    }[];
    replyTo?: {
        id: string;
        content: string;
        user: {
            name: string | null;
        };
    } | null;
}


// Helper to get user initials for avatar
const getInitials = (name: string | null, email: string | null): string => {
    if (name) {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    if (email) {
        return email.substring(0, 2).toUpperCase();
    }
    return '??';
};

// Generate a consistent gradient color based on name (using Viillaage teal palette)
const getAvatarGradient = (name: string | null, email: string | null): string => {
    const str = name || email || 'default';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Use teal-based hues (160-200 range) to stay within Viillaage color family
    const baseHue = 170; // Teal base
    const hueVariation = (Math.abs(hash) % 40) - 20; // -20 to +20 variation
    const hue1 = baseHue + hueVariation;
    const hue2 = hue1 + 15;
    const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
    return `linear-gradient(135deg, hsl(${hue1}, ${saturation}%, 45%), hsl(${hue2}, ${saturation}%, 38%))`;
};

const UserAvatar = ({ user, size = 32 }: { user: Message['user'], size?: number }) => {
    if (user.image) {
        return (
            <Image
                src={user.image}
                alt={user.name || 'User'}
                width={size}
                height={size}
                style={{
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
                loading="lazy"
            />
        );
    }
    return (
        <div style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: getAvatarGradient(user.name, user.email),
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${size * 0.38}px`,
            fontWeight: '600',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}>
            {getInitials(user.name, user.email)}
        </div>
    );
};

export default function MessagesPage() {
    const { data: session } = useSession();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
    const [showMobileChat, setShowMobileChat] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchChannels();
        // Close menu when clicking outside
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Don't close if clicking on the menu trigger or menu itself
            if (!target.closest('.message-menu-trigger') && !target.closest('.message-dropdown-menu')) {
                setActiveMenuId(null);
                setShowEmojiPicker(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        if (selectedChannel) {
            fetchMessages(selectedChannel.id);
        }
    }, [selectedChannel]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchChannels = async () => {
        try {
            const response = await fetch('/api/channels');
            if (response.ok) {
                const data = await response.json();
                setChannels(data);
                if (data.length > 0) {
                    setSelectedChannel(data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (channelId: string) => {
        try {
            const response = await fetch(`/api/messages?channelId=${channelId}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const [replyingTo, setReplyingTo] = useState<Message | null>(null);

    // ... (useEffect hooks remain)

    // ... (fetchChannels and fetchMessages remain)

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChannel || !session?.user) return;

        const messageContent = newMessage;
        const tempId = `temp-${Date.now()}`;

        if (editingMessage) {
            // Optimistic UI for editing: Update message immediately
            const previousMessages = [...messages];
            setMessages(prev => prev.map(msg =>
                msg.id === editingMessage.id
                    ? { ...msg, content: messageContent }
                    : msg
            ));
            setNewMessage('');
            setEditingMessage(null);

            try {
                const response = await fetch(`/api/messages/${editingMessage.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: messageContent }),
                });

                if (response.ok) {
                    const serverMessage = await response.json();
                    // Update with server response
                    setMessages(prev => prev.map(msg =>
                        msg.id === editingMessage.id ? serverMessage : msg
                    ));
                } else {
                    // Restore previous state on error
                    setMessages(previousMessages);
                    setNewMessage(messageContent);
                    setEditingMessage(editingMessage);
                    alert('Erreur lors de la modification du message');
                }
            } catch (error) {
                console.error('Error editing message:', error);
                // Restore previous state on error
                setMessages(previousMessages);
                setNewMessage(messageContent);
                setEditingMessage(editingMessage);
                alert('Erreur lors de la modification du message');
            }
        } else {
            // Optimistic UI for new message: Add message immediately
            const optimisticMessage: Message = {
                id: tempId,
                content: messageContent,
                createdAt: new Date().toISOString(),
                userId: session.user.id!,
                user: {
                    name: session.user.name || null,
                    email: session.user.email || null,
                    image: session.user.image || null,
                },
                reactions: [],
                replyTo: replyingTo ? {
                    id: replyingTo.id,
                    content: replyingTo.content,
                    user: replyingTo.user,
                } : null,
            };

            setMessages(prev => [...prev, optimisticMessage]);
            setNewMessage('');
            setReplyingTo(null);

            try {
                const response = await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: messageContent,
                        channelId: selectedChannel.id,
                        replyToId: replyingTo?.id
                    }),
                });

                if (response.ok) {
                    const serverMessage = await response.json();
                    // Replace optimistic message with server response
                    setMessages(prev => prev.map(msg =>
                        msg.id === tempId ? serverMessage : msg
                    ));
                } else {
                    // Remove optimistic message on error
                    setMessages(prev => prev.filter(msg => msg.id !== tempId));
                    setNewMessage(messageContent);
                    alert('Erreur lors de l\'envoi du message');
                }
            } catch (error) {
                console.error('Error sending message:', error);
                // Remove optimistic message on error
                setMessages(prev => prev.filter(msg => msg.id !== tempId));
                setNewMessage(messageContent);
                alert('Erreur lors de l\'envoi du message');
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce message ?')) return;
        if (!selectedChannel) return;

        // Optimistic UI: Remove message immediately
        const previousMessages = [...messages];
        setMessages(prev => prev.filter(msg => msg.id !== id));
        setActiveMenuId(null);

        try {
            const response = await fetch(`/api/messages/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                // Restore message on error
                setMessages(previousMessages);
                alert('Erreur lors de la suppression du message');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            // Restore message on error
            setMessages(previousMessages);
            alert('Erreur lors de la suppression du message');
        }
    };

    const handleReaction = async (messageId: string, emoji: string) => {
        try {
            await fetch('/api/messages/react', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId, emoji }),
            });
            if (selectedChannel) {
                fetchMessages(selectedChannel.id);
            }
            setActiveMenuId(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (message: Message) => {
        setEditingMessage(message);
        setNewMessage(message.content);
        setActiveMenuId(null);
    };

    const cancelEdit = () => {
        setEditingMessage(null);
        setNewMessage('');
    };

    const groupedMessages = messages.reduce((acc: any[], message, index) => {
        const prevMessage = messages[index - 1];
        const isGrouped = prevMessage && prevMessage.userId === message.userId;

        acc.push({
            ...message,
            showAvatar: !isGrouped,
            showName: !isGrouped,
        });

        return acc;
    }, []);

    if (loading) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Loader text="Chargement des messages..." /></div>;
    }

    return (
        <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-md)', padding: '0 var(--spacing-md)' }}>Messagerie</h1>

            <div className="messages-container" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0, flexGrow: 1, overflow: 'hidden', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'white' }}>
                {/* Channels Sidebar */}
                <div
                    className={`channels-sidebar ${showMobileChat ? 'mobile-hidden' : ''}`}
                    style={{
                        backgroundColor: '#f8fafc',
                        borderRight: '1px solid var(--border)',
                        overflowY: 'auto',
                        padding: '0',
                    }}>
                    <h3 style={{
                        padding: '20px 20px 12px',
                        margin: 0,
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        letterSpacing: '0.5px',
                    }}>Canaux</h3>
                    <div style={{ padding: '0 8px' }}>
                        {channels.map((channel) => {
                            const isActive = selectedChannel?.id === channel.id;
                            return (
                                <div
                                    key={channel.id}
                                    onClick={() => {
                                        setSelectedChannel(channel);
                                        setShowMobileChat(true);
                                    }}
                                    className="channel-item"
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: isActive ? 'white' : 'transparent',
                                        color: isActive ? 'var(--text-main)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        marginBottom: '2px',
                                        transition: 'all 0.15s ease',
                                        boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                        fontWeight: isActive ? '600' : '500',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.6)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    {/* Active indicator bar */}
                                    {isActive && (
                                        <div style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '3px',
                                            height: '60%',
                                            backgroundColor: 'var(--primary)',
                                            borderRadius: '0 4px 4px 0',
                                        }} />
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: isActive ? '8px' : '0' }}>
                                        <span style={{
                                            fontSize: '1.1rem',
                                            opacity: isActive ? 1 : 0.5,
                                            color: isActive ? 'var(--primary)' : 'inherit',
                                        }}>#</span>
                                        <span style={{ fontSize: '0.9rem' }}>{channel.name}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Messages Area */}
                <div
                    className={`chat-area ${!showMobileChat ? 'mobile-hidden' : ''}`}
                    style={{
                        backgroundColor: '#fafbfc',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                        height: '100%',
                        overflow: 'hidden',
                    }}>
                    {selectedChannel ? (
                        <>
                            {/* Channel Header */}
                            <div style={{
                                padding: '12px 20px',
                                borderBottom: '1px solid rgba(0,0,0,0.06)',
                                backgroundColor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                zIndex: 10,
                            }}>
                                <button
                                    className="mobile-back-button"
                                    onClick={() => setShowMobileChat(false)}
                                    style={{
                                        display: 'none',
                                        marginRight: '4px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        color: 'var(--text-secondary)'
                                    }}
                                >
                                    <ArrowLeft size={22} />
                                </button>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #00BFA5 0%, #008F7A 100%)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 6px rgba(0, 191, 165, 0.3)',
                                }}>
                                    #
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{selectedChannel.name}</h2>
                                    {selectedChannel.description && (
                                        <p style={{ margin: '1px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {selectedChannel.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div style={{
                                flexGrow: 1,
                                overflowY: 'auto',
                                minHeight: 0,
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                            }}>
                                {groupedMessages.map((message: any) => {
                                    const isOwnMessage = session?.user?.id === message.userId;

                                    return (
                                        <div
                                            key={message.id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                                                alignItems: 'flex-end',
                                                gap: '8px',
                                                marginTop: message.showAvatar ? '12px' : '2px',
                                                paddingRight: isOwnMessage ? '0' : '40px',
                                                paddingLeft: isOwnMessage ? '40px' : '0',
                                            }}
                                        >
                                            {/* Avatar (left side for others) */}
                                            {!isOwnMessage && (
                                                <div style={{ width: '32px', visibility: message.showAvatar ? 'visible' : 'hidden' }}>
                                                    <UserAvatar user={message.user} />
                                                </div>
                                            )}

                                            {/* Message Bubble */}
                                            <div style={{
                                                position: 'relative',
                                                maxWidth: '100%',
                                            }}>
                                                {message.showName && !isOwnMessage && (
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        color: 'var(--text-secondary)',
                                                        marginBottom: '4px',
                                                        marginLeft: '12px',
                                                    }}>
                                                        {message.user.name || 'Anonyme'}
                                                    </div>
                                                )}

                                                <div
                                                    className="message-bubble"
                                                    style={{
                                                        padding: '10px 14px',
                                                        // Dynamic border radius for message grouping
                                                        borderTopLeftRadius: !isOwnMessage && !message.showAvatar ? '4px' : '18px',
                                                        borderTopRightRadius: isOwnMessage && !message.showAvatar ? '4px' : '18px',
                                                        borderBottomLeftRadius: !isOwnMessage ? '4px' : '18px',
                                                        borderBottomRightRadius: isOwnMessage ? '4px' : '18px',
                                                        // Gradient for own messages using Viillaage teal
                                                        background: isOwnMessage
                                                            ? 'linear-gradient(135deg, #00BFA5 0%, #008F7A 100%)'
                                                            : 'white',
                                                        color: isOwnMessage ? 'white' : 'var(--text-main)',
                                                        boxShadow: isOwnMessage
                                                            ? '0 2px 8px rgba(0, 191, 165, 0.35)'
                                                            : '0 1px 3px rgba(0,0,0,0.08)',
                                                        position: 'relative',
                                                        fontSize: '0.9rem',
                                                        lineHeight: '1.45',
                                                        maxWidth: '75%',
                                                    }}
                                                >
                                                    {/* Reply preview */}
                                                    {message.replyTo && (
                                                        <div style={{
                                                            padding: '4px 8px',
                                                            marginBottom: '6px',
                                                            borderLeft: `2px solid ${isOwnMessage ? 'rgba(255,255,255,0.6)' : 'var(--primary)'}`,
                                                            backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.03)',
                                                            borderRadius: '3px',
                                                            fontSize: '0.75rem',
                                                            display: 'flex',
                                                            gap: '4px',
                                                        }}>
                                                            <div style={{
                                                                fontWeight: '600',
                                                                marginBottom: '2px',
                                                                color: isOwnMessage ? 'rgba(255,255,255,0.9)' : 'var(--primary)'
                                                            }}>
                                                                {message.replyTo.user.name || 'Anonyme'}
                                                            </div>
                                                            <div style={{
                                                                opacity: 0.8,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {message.replyTo.content}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div style={{ lineHeight: '1.5' }}>{message.content}</div>

                                                    {/* Reactions */}
                                                    {message.reactions && message.reactions.length > 0 && (
                                                        <div style={{
                                                            display: 'flex',
                                                            gap: '3px',
                                                            marginTop: '4px',
                                                            flexWrap: 'wrap',
                                                        }}>
                                                            {Object.values(
                                                                message.reactions.reduce((acc: any, reaction: any) => {
                                                                    if (!acc[reaction.emoji]) {
                                                                        acc[reaction.emoji] = { emoji: reaction.emoji, count: 0, users: [] };
                                                                    }
                                                                    acc[reaction.emoji].count++;
                                                                    acc[reaction.emoji].users.push(reaction.user.name || 'Anonyme');
                                                                    return acc;
                                                                }, {})
                                                            ).map((reaction: any) => (
                                                                <button
                                                                    key={reaction.emoji}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleReaction(message.id, reaction.emoji);
                                                                    }}
                                                                    title={reaction.users.join(', ')}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '3px',
                                                                        padding: '2px 6px',
                                                                        borderRadius: '10px',
                                                                        border: 'none',
                                                                        backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.85rem',
                                                                        transition: 'background 0.2s',
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = isOwnMessage ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = isOwnMessage ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)';
                                                                    }}
                                                                >
                                                                    <span>{reaction.emoji}</span>
                                                                    <span style={{ color: isOwnMessage ? 'white' : 'var(--text-main)' }}>
                                                                        {reaction.count}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div style={{
                                                        fontSize: '0.65rem',
                                                        color: isOwnMessage ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)',
                                                        marginTop: '4px',
                                                        textAlign: 'right',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-end',
                                                        gap: '4px',
                                                    }}>
                                                        {new Date(message.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>

                                                    {/* Context Menu Button (visible on hover or active) */}
                                                    <div
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            console.log('Menu trigger clicked', message.id);
                                                            setActiveMenuId(activeMenuId === message.id ? null : message.id);
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                                        onMouseLeave={(e) => e.currentTarget.style.opacity = activeMenuId === message.id ? '1' : '0.3'}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '50%',
                                                            [isOwnMessage ? 'left' : 'right']: '-32px',
                                                            transform: 'translateY(-50%)',
                                                            padding: '8px',
                                                            cursor: 'pointer',
                                                            opacity: activeMenuId === message.id ? 1 : 0.3,
                                                            transition: 'opacity 0.2s',
                                                            color: isOwnMessage ? 'white' : 'var(--text-secondary)',
                                                            backgroundColor: activeMenuId === message.id ? 'rgba(0,0,0,0.1)' : 'transparent',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            zIndex: 20,
                                                        }}
                                                        className="message-menu-trigger"
                                                    >
                                                        <MoreVertical size={16} style={{ pointerEvents: 'none' }} />
                                                    </div>

                                                    {/* Dropdown Menu */}
                                                    {activeMenuId === message.id && (
                                                        <div
                                                            className="message-dropdown-menu"
                                                            style={{
                                                                position: 'absolute',
                                                                top: '100%',
                                                                right: isOwnMessage ? '0' : 'auto',
                                                                left: isOwnMessage ? 'auto' : '0',
                                                                marginTop: '4px',
                                                                backgroundColor: 'white',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                                zIndex: 1000,
                                                                minWidth: '120px',
                                                                overflow: 'hidden',
                                                                animation: 'fadeIn 0.1s ease',
                                                                border: '1px solid var(--border)',
                                                            }}>
                                                            {isOwnMessage ? (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEdit(message);
                                                                        }}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '8px 12px',
                                                                            textAlign: 'left',
                                                                            border: 'none',
                                                                            background: 'none',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px',
                                                                            fontSize: '0.85rem',
                                                                            color: 'var(--text-main)',
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                    >
                                                                        <Edit2 size={14} /> Modifier
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDelete(message.id);
                                                                        }}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '8px 12px',
                                                                            textAlign: 'left',
                                                                            border: 'none',
                                                                            background: 'none',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px',
                                                                            fontSize: '0.85rem',
                                                                            color: '#ef4444',
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                    >
                                                                        <Trash2 size={14} /> Supprimer
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setActiveMenuId(null);
                                                                            setReplyingTo(message);
                                                                        }}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '8px 12px',
                                                                            textAlign: 'left',
                                                                            border: 'none',
                                                                            background: 'none',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px',
                                                                            fontSize: '0.85rem',
                                                                            color: 'var(--text-main)',
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                    >
                                                                        <span>↩️</span> Répondre
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setActiveMenuId(null);
                                                                            setShowEmojiPicker(message.id);
                                                                        }}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '8px 12px',
                                                                            textAlign: 'left',
                                                                            border: 'none',
                                                                            background: 'none',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px',
                                                                            fontSize: '0.85rem',
                                                                            color: 'var(--text-main)',
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                    >
                                                                        <span>👍</span> Réagir
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Emoji Picker */}
                                                    {showEmojiPicker === message.id && (
                                                        <div
                                                            className="message-dropdown-menu"
                                                            style={{
                                                                position: 'absolute',
                                                                top: '100%',
                                                                left: '50%',
                                                                transform: 'translateX(-50%)',
                                                                marginTop: '4px',
                                                                backgroundColor: 'white',
                                                                borderRadius: '12px',
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                                zIndex: 1000,
                                                                padding: '8px',
                                                                display: 'flex',
                                                                gap: '4px',
                                                                border: '1px solid var(--border)',
                                                            }}
                                                        >
                                                            {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
                                                                <button
                                                                    key={emoji}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleReaction(message.id, emoji);
                                                                        setShowEmojiPicker(null);
                                                                    }}
                                                                    style={{
                                                                        border: 'none',
                                                                        background: 'none',
                                                                        cursor: 'pointer',
                                                                        fontSize: '1.5rem',
                                                                        padding: '8px',
                                                                        borderRadius: '8px',
                                                                        transition: 'transform 0.1s, background 0.2s',
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                                                        e.currentTarget.style.transform = 'scale(1.2)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                                        e.currentTarget.style.transform = 'scale(1)';
                                                                    }}
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div style={{
                                padding: '16px 24px',
                                backgroundColor: '#f0f2f5',
                                borderTop: '1px solid var(--border)',
                            }}>
                                {editingMessage && (
                                    <div style={{
                                        marginBottom: '12px',
                                        padding: '12px',
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderLeft: '4px solid var(--primary)',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '600', color: 'var(--primary)', marginBottom: '4px' }}>Modification du message</span>
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{editingMessage.content}</span>
                                        </div>
                                        <button
                                            onClick={cancelEdit}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--text-secondary)',
                                                padding: '4px',
                                            }}
                                        >
                                        </button>
                                    </div>
                                )}

                                {replyingTo && (
                                    <div style={{
                                        marginBottom: '12px',
                                        padding: '12px',
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderLeft: '4px solid #48bb78',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '600', color: '#48bb78', marginBottom: '4px' }}>
                                                Répondre à {replyingTo.user.name || 'Anonyme'}
                                            </span>
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                {replyingTo.content}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setReplyingTo(null)}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--text-secondary)',
                                                padding: '4px',
                                            }}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}

                                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', maxWidth: '100%', paddingRight: '2px' }}>
                                    <div style={{
                                        flexGrow: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: 'white',
                                        borderRadius: '20px',
                                        border: '1px solid #e0e0e0',
                                        padding: '4px 4px',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                                    }}>
                                        <button
                                            type="button"
                                            style={{
                                                flexShrink: 0,
                                                padding: '6px',
                                                borderRadius: '50%',
                                                border: 'none',
                                                background: 'none',
                                                cursor: 'pointer',
                                                color: '#65676b',
                                                transition: 'background 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            title="Emojis"
                                        >
                                            <Smile size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            style={{
                                                flexShrink: 0,
                                                padding: '6px',
                                                borderRadius: '50%',
                                                border: 'none',
                                                background: 'none',
                                                cursor: 'pointer',
                                                color: '#65676b',
                                                transition: 'background 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '2px'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            title="Pièce jointe"
                                        >
                                            <Paperclip size={18} />
                                        </button>

                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Écrivez un message..."
                                            style={{
                                                flexGrow: 1,
                                                minWidth: '0',
                                                padding: '8px 2px',
                                                border: 'none',
                                                fontSize: '0.9rem',
                                                backgroundColor: 'transparent',
                                                outline: 'none',
                                                color: 'var(--text-main)',
                                            }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        style={{
                                            flexShrink: 0,
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: newMessage.trim()
                                                ? 'linear-gradient(135deg, #00BFA5 0%, #008F7A 100%)'
                                                : '#e4e6eb',
                                            color: newMessage.trim() ? 'white' : '#bcc0c4',
                                            cursor: newMessage.trim() ? 'pointer' : 'default',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s ease',
                                            boxShadow: newMessage.trim() ? '0 4px 12px rgba(0, 191, 165, 0.4)' : 'none',
                                            transform: 'scale(1)',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (newMessage.trim()) {
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 191, 165, 0.5)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = newMessage.trim() ? '0 4px 12px rgba(0, 191, 165, 0.4)' : 'none';
                                        }}
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: 'var(--text-secondary)',
                            gap: '16px',
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                backgroundColor: '#f0f2f5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <span style={{ fontSize: '2rem' }}>👋</span>
                            </div>
                            <h3 style={{ margin: 0 }}>Bienvenue dans la messagerie</h3>
                            <p style={{ margin: 0 }}>Sélectionnez un canal pour commencer à discuter</p>
                        </div>
                    )}
                </div>
            </div>
            <style jsx global>{`
                .message-bubble:hover .message-menu-trigger {
                    opacity: 1 !important;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 768px) {
                    .messages-container {
                        display: flex !important;
                        flex-direction: column;
                        width: 100% !important;
                        border: none !important;
                        border-radius: 0 !important;
                        background-color: transparent !important;
                    }
                    .channels-sidebar.mobile-hidden {
                        display: none !important;
                    }
                    .chat-area {
                        width: 100% !important;
                        flex: 1;
                    }
                    .chat-area.mobile-hidden {
                        display: none !important;
                    }
                    .mobile-back-button {
                        display: block !important;
                    }
                    /* Reduce padding on mobile */
                    .chat-area > div:first-child { /* Header */
                        padding: 12px 16px !important;
                    }
                    .chat-area > div:last-child { /* Input */
                        padding: 12px 16px !important;
                    }
                }
            `}</style>
        </div>
    );
}
