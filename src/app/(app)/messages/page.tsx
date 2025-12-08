'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Smile, Paperclip, MoreVertical, Edit2, Trash2, X, ArrowLeft } from 'lucide-react';

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

const UserAvatar = ({ user, size = 32 }: { user: Message['user'], size?: number }) => {
    if (user.image) {
        return (
            <img
                src={user.image}
                alt={user.name || 'User'}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                }}
            />
        );
    }
    return (
        <div style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${size * 0.4}px`,
            fontWeight: '600',
            flexShrink: 0,
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
        if (!newMessage.trim() || !selectedChannel) return;

        try {
            const url = editingMessage ? `/api/messages/${editingMessage.id}` : '/api/messages';
            const method = editingMessage ? 'PATCH' : 'POST';
            const body = editingMessage
                ? { content: newMessage }
                : {
                    content: newMessage,
                    channelId: selectedChannel.id,
                    replyToId: replyingTo?.id
                };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                setNewMessage('');
                setEditingMessage(null);
                setReplyingTo(null);
                fetchMessages(selectedChannel.id);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce message ?')) return;
        if (!selectedChannel) return;

        try {
            const response = await fetch(`/api/messages/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchMessages(selectedChannel.id);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
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
        return <div>Chargement...</div>;
    }

    return (
        <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-md)', padding: '0 var(--spacing-md)' }}>Messagerie</h1>

            <div className="messages-container" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0, flexGrow: 1, overflow: 'hidden', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'white' }}>
                {/* Channels Sidebar */}
                <div
                    className={`channels-sidebar ${showMobileChat ? 'mobile-hidden' : ''}`}
                    style={{
                        backgroundColor: '#f5f7f9',
                        borderRight: '1px solid var(--border)',
                        overflowY: 'auto',
                        padding: 'var(--spacing-sm)',
                    }}>
                    <h3 style={{ padding: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Canaux</h3>
                    {channels.map((channel) => (
                        <div
                            key={channel.id}
                            onClick={() => {
                                setSelectedChannel(channel);
                                setShowMobileChat(true);
                            }}
                            style={{
                                padding: '10px 12px',
                                borderRadius: '8px',
                                backgroundColor: selectedChannel?.id === channel.id ? 'white' : 'transparent',
                                color: selectedChannel?.id === channel.id ? 'var(--primary)' : 'var(--text-main)',
                                cursor: 'pointer',
                                marginBottom: '4px',
                                transition: 'all 0.2s ease',
                                boxShadow: selectedChannel?.id === channel.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                fontWeight: selectedChannel?.id === channel.id ? '600' : 'normal',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ opacity: 0.6 }}>#</span>
                                <span>{channel.name}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Messages Area */}
                <div
                    className={`chat-area ${!showMobileChat ? 'mobile-hidden' : ''}`}
                    style={{
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                        backgroundBlendMode: 'soft-light',
                        height: '100%',
                        overflow: 'hidden',
                    }}>
                    {selectedChannel ? (
                        <>
                            {/* Channel Header */}
                            <div style={{
                                padding: '16px 24px',
                                borderBottom: '1px solid var(--border)',
                                backgroundColor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                zIndex: 10,
                            }}>
                                <button
                                    className="mobile-back-button"
                                    onClick={() => setShowMobileChat(false)}
                                    style={{
                                        display: 'none',
                                        marginRight: '8px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        color: 'var(--text-secondary)'
                                    }}
                                >
                                    <ArrowLeft size={24} />
                                </button>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    backgroundColor: 'var(--primary-light)',
                                    color: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                }}>
                                    #
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedChannel.name}</h2>
                                    {selectedChannel.description && (
                                        <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
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
                                                        padding: '10px 16px',
                                                        borderRadius: '18px',
                                                        borderTopLeftRadius: !isOwnMessage && !message.showAvatar ? '4px' : '18px',
                                                        borderTopRightRadius: isOwnMessage && !message.showAvatar ? '4px' : '18px',
                                                        borderBottomLeftRadius: !isOwnMessage ? '4px' : '18px',
                                                        borderBottomRightRadius: isOwnMessage ? '4px' : '18px',
                                                        backgroundColor: isOwnMessage ? 'var(--primary)' : '#f0f2f5',
                                                        color: isOwnMessage ? 'white' : 'var(--text-main)',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                        position: 'relative',
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
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                                zIndex: 1000,
                                                                minWidth: '160px',
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
                                                                            padding: '10px 16px',
                                                                            textAlign: 'left',
                                                                            border: 'none',
                                                                            background: 'none',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px',
                                                                            fontSize: '0.9rem',
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
                                                                            padding: '10px 16px',
                                                                            textAlign: 'left',
                                                                            border: 'none',
                                                                            background: 'none',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px',
                                                                            fontSize: '0.9rem',
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
                                                                            padding: '10px 16px',
                                                                            textAlign: 'left',
                                                                            border: 'none',
                                                                            background: 'none',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px',
                                                                            fontSize: '0.9rem',
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
                                                                            padding: '10px 16px',
                                                                            textAlign: 'left',
                                                                            border: 'none',
                                                                            background: 'none',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px',
                                                                            fontSize: '0.9rem',
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

                                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        style={{
                                            flexShrink: 0,
                                            padding: '8px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--text-secondary)',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Smile size={24} />
                                    </button>
                                    <button
                                        type="button"
                                        style={{
                                            flexShrink: 0,
                                            padding: '8px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--text-secondary)',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Paperclip size={24} />
                                    </button>

                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Écrivez un message..."
                                        style={{
                                            flexGrow: 1,
                                            minWidth: 0,
                                            padding: '12px 20px',
                                            borderRadius: '24px',
                                            border: 'none',
                                            fontSize: '1rem',
                                            backgroundColor: 'white',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            outline: 'none',
                                        }}
                                    />

                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        style={{
                                            flexShrink: 0,
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            backgroundColor: newMessage.trim() ? 'var(--primary)' : '#e4e6eb',
                                            color: newMessage.trim() ? 'white' : '#bcc0c4',
                                            cursor: newMessage.trim() ? 'pointer' : 'default',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s',
                                            boxShadow: newMessage.trim() ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                        }}
                                    >
                                        <Send size={20} />
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
