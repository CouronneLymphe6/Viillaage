export interface PasswordStrength {
    score: number; // 0-5
    label: string;
    color: string;
    isValid: boolean;
}

export function validatePassword(password: string): PasswordStrength {
    let score = 0;
    const feedback: string[] = [];

    // Minimum 8 caractères
    if (password.length >= 8) {
        score++;
    } else {
        feedback.push('Au moins 8 caractères');
    }

    // Au moins 1 minuscule
    if (/[a-z]/.test(password)) {
        score++;
    } else {
        feedback.push('Au moins 1 minuscule');
    }

    // Au moins 1 majuscule
    if (/[A-Z]/.test(password)) {
        score++;
    } else {
        feedback.push('Au moins 1 majuscule');
    }

    // Au moins 1 chiffre
    if (/[0-9]/.test(password)) {
        score++;
    } else {
        feedback.push('Au moins 1 chiffre');
    }

    // Au moins 1 caractère spécial
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        score++;
    } else {
        feedback.push('Au moins 1 caractère spécial');
    }

    // Labels et couleurs
    const labels = [
        { label: 'Très faible', color: '#ef4444', isValid: false },
        { label: 'Faible', color: '#f97316', isValid: false },
        { label: 'Moyen', color: '#f59e0b', isValid: false },
        { label: 'Bon', color: '#84cc16', isValid: true },
        { label: 'Fort', color: '#22c55e', isValid: true },
        { label: 'Très fort', color: '#10b981', isValid: true },
    ];

    return {
        score,
        ...labels[score],
    };
}

export function isPasswordValid(password: string): boolean {
    return validatePassword(password).isValid;
}
