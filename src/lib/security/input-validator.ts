import { z } from 'zod';
import validator from 'validator';

/**
 * Schémas de validation Zod pour les entrées utilisateur
 */

// Validation d'email
export const emailSchema = z.string()
    .email('Email invalide')
    .max(255, 'Email trop long')
    .refine((email) => validator.isEmail(email), {
        message: 'Format d\'email invalide'
    });

// Validation de mot de passe fort
export const passwordSchema = z.string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .max(128, 'Mot de passe trop long')
    .refine((password) => {
        // Au moins une majuscule, une minuscule, un chiffre et un caractère spécial
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    }, {
        message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    });

// Validation de nom
export const nameSchema = z.string()
    .min(1, 'Le nom est requis')
    .max(100, 'Nom trop long')
    .refine((name) => {
        // Seulement lettres, espaces, tirets et apostrophes
        return /^[a-zA-ZÀ-ÿ\s\-']+$/.test(name);
    }, {
        message: 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
    });

// Validation de téléphone
export const phoneSchema = z.string()
    .optional()
    .refine((phone) => {
        if (!phone) return true;
        return validator.isMobilePhone(phone, 'fr-FR');
    }, {
        message: 'Numéro de téléphone invalide'
    });

// Validation d'URL
export const urlSchema = z.string()
    .optional()
    .refine((url) => {
        if (!url) return true;
        return validator.isURL(url, {
            protocols: ['http', 'https'],
            require_protocol: true
        });
    }, {
        message: 'URL invalide'
    });

// Validation de coordonnées GPS
export const latitudeSchema = z.number()
    .min(-90, 'Latitude invalide')
    .max(90, 'Latitude invalide');

export const longitudeSchema = z.number()
    .min(-180, 'Longitude invalide')
    .max(180, 'Longitude invalide');

export const coordinatesSchema = z.object({
    latitude: latitudeSchema,
    longitude: longitudeSchema
});

// Validation de code postal français
export const zipCodeSchema = z.string()
    .regex(/^[0-9]{5}$/, 'Code postal invalide (5 chiffres requis)');

// Validation de description/contenu
export const descriptionSchema = z.string()
    .min(1, 'La description est requise')
    .max(500, 'Description trop longue (max 500 caractères)')
    .refine((desc) => {
        // Bloquer les URLs suspectes multiples (spam)
        const urlCount = (desc.match(/https?:\/\//g) || []).length;
        return urlCount <= 2;
    }, {
        message: 'Trop de liens dans la description'
    });

// Validation de message
export const messageSchema = z.string()
    .min(1, 'Le message ne peut pas être vide')
    .max(2000, 'Message trop long (max 2000 caractères)')
    .refine((msg) => {
        // Détecter les répétitions excessives (spam)
        const words = msg.split(/\s+/);
        const uniqueWords = new Set(words);
        const repetitionRatio = uniqueWords.size / words.length;
        return repetitionRatio > 0.3; // Au moins 30% de mots uniques
    }, {
        message: 'Message suspect détecté'
    });

// Validation de type d'alerte
export const alertTypeSchema = z.enum([
    'THEFT',
    'ACCIDENT',
    'FIRE',
    'SUSPICIOUS',
    'ROAD_HAZARD',
    'ANIMAL',
    'OTHER',
    'OFFICIAL_ANNOUNCEMENT',
    'OFFICIAL_EMERGENCY',
    'OFFICIAL_MAINTENANCE'
]);

// Validation de catégorie de listing
export const listingCategorySchema = z.enum([
    'SELL',
    'GIVE',
    'EXCHANGE',
    'LEND'
]);

// Validation de prix
export const priceSchema = z.number()
    .min(0, 'Le prix ne peut pas être négatif')
    .max(1000000, 'Prix trop élevé')
    .optional();

// Validation d'ID (CUID ou UUID)
export const idSchema = z.string()
    .refine((id) => {
        // Accept cuid format: c followed by 24 alphanumeric chars
        const isCuid = /^c[a-z0-9]{24}$/.test(id);
        // Accept UUID format: 8-4-4-4-12 hex chars
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        return isCuid || isUuid;
    }, 'ID invalide');

/**
 * Fonction utilitaire pour sanitizer les chaînes de caractères
 */
export function sanitizeString(input: string): string {
    // Supprimer les caractères de contrôle
    let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');

    // Normaliser les espaces
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    return sanitized;
}

/**
 * Fonction pour valider et sanitizer les entrées
 */
export function validateAndSanitize<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: string } {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            return {
                success: false,
                error: firstError.message
            };
        }
        return {
            success: false,
            error: 'Validation error'
        };
    }
}

/**
 * Schémas pour les routes API
 */

// POST /api/alerts
export const createAlertSchema = z.object({
    type: alertTypeSchema,
    description: descriptionSchema,
    latitude: latitudeSchema.optional().default(0),
    longitude: longitudeSchema.optional().default(0),
    photoUrl: z.string().url('URL invalide').optional().or(z.literal(''))
});

// POST /api/register
export const registerSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    villageId: idSchema.optional()
});

// POST /api/messages
export const createMessageSchema = z.object({
    content: messageSchema,
    channelId: idSchema,
    replyToId: idSchema.optional()
});

// POST /api/listings
export const createListingSchema = z.object({
    title: z.string().min(3).max(100),
    description: descriptionSchema,
    price: priceSchema,
    category: listingCategorySchema
});

// POST /api/events
export const createEventSchema = z.object({
    title: z.string().min(3).max(100),
    description: descriptionSchema,
    date: z.string().datetime(),
    location: z.string().max(200).optional(),
    photoUrl: urlSchema.optional()
});

// PUT /api/user/profile
export const updateProfileSchema = z.object({
    name: nameSchema.optional(),
    bio: z.string().max(500).optional(),
    address: z.string().max(200).optional(),
    phone: phoneSchema,
    villageName: z.string().max(100).optional(),
    zipCode: zipCodeSchema.optional()
});
