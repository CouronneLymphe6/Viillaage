import { Resend } from 'resend';
import { logger } from './logger';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendPasswordResetEmailParams {
    to: string;
    resetLink: string;
    userName?: string;
}

export async function sendPasswordResetEmail({
    to,
    resetLink,
    userName = 'Utilisateur',
}: SendPasswordResetEmailParams) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Viillaage <noreply@viillaage.com>',
            to: [to],
            subject: 'Réinitialisation de votre mot de passe - Viillaage',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background-color: #f9fafb;
                            border-radius: 8px;
                            padding: 30px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .logo {
                            font-size: 24px;
                            font-weight: bold;
                            color: #10b981;
                        }
                        .content {
                            background-color: white;
                            border-radius: 8px;
                            padding: 30px;
                            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                        }
                        .button {
                            display: inline-block;
                            background-color: #10b981;
                            color: white;
                            text-decoration: none;
                            padding: 12px 30px;
                            border-radius: 6px;
                            font-weight: 600;
                            margin: 20px 0;
                        }
                        .button:hover {
                            background-color: #059669;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            font-size: 14px;
                            color: #6b7280;
                        }
                        .warning {
                            background-color: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 12px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">Viillaage</div>
                        </div>
                        <div class="content">
                            <h2>Réinitialisation de votre mot de passe</h2>
                            <p>Bonjour ${userName},</p>
                            <p>Vous avez demandé à réinitialiser votre mot de passe sur Viillaage.</p>
                            <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
                            <div style="text-align: center;">
                                <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
                            </div>
                            <p>Ou copiez ce lien dans votre navigateur :</p>
                            <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetLink}</p>
                            <div class="warning">
                                <strong>⚠️ Important :</strong> Ce lien est valable pendant 24 heures. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                            </div>
                        </div>
                        <div class="footer">
                            <p>Cet email a été envoyé par Viillaage</p>
                            <p>Le réseau social de votre village</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            logger.error('Error sending password reset email:', error);
            return { success: false, error };
        }

        logger.info('Password reset email sent successfully');
        return { success: true, data };
    } catch (error) {
        logger.error('Failed to send password reset email:', error);
        return { success: false, error };
    }
}
