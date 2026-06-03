const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Limpia la sesión y notifica a la app que el token expiró.
 * El hook useAuthError escucha este evento y redirige al login.
 */
const handleTokenExpired = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('technicianId');
    localStorage.removeItem('clientId');
    window.dispatchEvent(new Event('auth:expired'));
};

export const fetchData = async (endpoint, options = {}) => {
    try {
        const isFormData = options.body instanceof FormData;
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Accept': 'application/json',
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...options.headers,
            },
        });

        // Token expirado o no autenticado → redirigir automáticamente al login
        if (response.status === 401) {
            handleTokenExpired();
            const error = new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            error.status = 401;
            throw error;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || `Error: ${response.statusText}`);
            error.status = response.status;
            error.data = errorData;
            throw error;
        }

        const data = await response.json();

        // Custom error handling for 200 OK responses with status: "error" (e.g. form validation)
        if (data && data.status === 'error') {
            const error = new Error(data.message || 'Error');
            error.data = data;
            throw error;
        }

        return data;
    } catch (error) {
        // No re-loggear errores de autenticación (ya se loggean arriba)
        if (error.status !== 401) {
            console.error('API call failed:', error);
        }
        throw error;
    }
};

export const getStorageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const storageBase = import.meta.env.VITE_API_STORAGE_URL || 'http://localhost:8000/storage';
    let cleanPath = path.startsWith('/') ? path.substring(1) : path;
    // Evitar doble prefijo storage/ cuando la API ya lo incluye
    if (cleanPath.startsWith('storage/')) {
        cleanPath = cleanPath.substring('storage/'.length);
    }
    return `${storageBase}/${cleanPath}`;
};

export const getProfileImageUrl = (entity) => {
    if (!entity) return null;
    const path = entity.image
        || entity.user?.image
        || entity.profile_photo
        || entity.photo
        || entity.avatar;
    return getStorageUrl(path);
};

export const extractCaseImages = (caseData) => {
    if (!caseData) return [];
    const images = caseData.images
        || caseData.photos
        || caseData.case_images
        || caseData.service_case_images
        || caseData.media
        || caseData.attachments;
    return Array.isArray(images) ? images : [];
};

export const getCaseImageUrl = (imagesOrCase) => {
    if (!imagesOrCase) return null;

    // Aceptar el objeto completo del caso
    if (!Array.isArray(imagesOrCase) && typeof imagesOrCase === 'object') {
        const collections = [
            imagesOrCase.images,
            imagesOrCase.photos,
            imagesOrCase.case_images,
            imagesOrCase.service_case_images,
            imagesOrCase.media,
            imagesOrCase.attachments,
        ];
        for (const collection of collections) {
            if (Array.isArray(collection) && collection.length) {
                const url = getCaseImageUrl(collection);
                if (url) return url;
            }
        }
        const directPath = imagesOrCase.image_path
            || imagesOrCase.image_url
            || imagesOrCase.cover_image
            || imagesOrCase.thumbnail
            || imagesOrCase.first_image
            || imagesOrCase.image;
        return getStorageUrl(directPath);
    }

    if (!imagesOrCase.length) return null;
    const img = imagesOrCase[0];
    if (typeof img === 'string') return getStorageUrl(img);
    const path = img.image_path
        || img.url
        || img.path
        || img.file_path
        || img.original_url
        || img.full_url
        || img.src
        || img.file;
    return getStorageUrl(path);
};

export const enrichCasesWithImages = async (casesList, detailEndpoint = (id) => `/admin/cases/${id}`) => {
    if (!casesList?.length) return casesList;

    return Promise.all(
        casesList.map(async (caseItem) => {
            if (getCaseImageUrl(caseItem)) return caseItem;

            try {
                const response = await fetchData(detailEndpoint(caseItem.id));
                const detail = response.data?.case
                    || response.data?.service_case
                    || response.data
                    || response;
                const images = extractCaseImages(detail);
                if (images.length > 0) {
                    return { ...caseItem, images };
                }
            } catch (err) {
                console.warn(`No se pudieron cargar imágenes del caso ${caseItem.id}`, err);
            }
            return caseItem;
        })
    );
};

/** ID del caso asociado a una conversación (misma fuente que la lista de chats). */
export const getChatServiceCaseId = (conversation) => {
    if (!conversation) return null;
    const id = conversation.service_case_id ?? conversation.service_case?.id;
    return id != null ? id : null;
};

export const getChatOtherParticipant = (conversation, role) => {
    if (!conversation) return null;
    if (role === 'client') {
        return conversation.technician
            || conversation.accepted_technician
            || conversation.other_user
            || conversation.other_participant;
    }
    return conversation.client
        || conversation.other_user
        || conversation.other_participant;
};

export const getChatParticipantUser = (participant) => {
    if (!participant) return null;
    return participant.user || participant;
};

export const getAcceptedProposal = (source) => {
    if (!source) return null;
    return source.case_response
        || source.accepted_response
        || source.service_case?.accepted_response
        || source.service_case?.responses?.find(
            (r) => r.technician_id === source.technician_id
                || r.technician_id === source.technician?.id
                || r.technician_id === source.accepted_technician_id
                || r.technician_id === source.service_case?.accepted_technician_id
        )
        || source.responses?.find(
            (r) => r.technician_id === source.accepted_technician_id
        );
};

export const getCaseProposals = (caseData) => {
    const items = [];
    const responses = caseData?.responses || caseData?.case_responses || [];
    responses.forEach((r) => items.push({ ...r, isResponse: true }));

    const acceptedId = caseData?.accepted_technician_id;
    if (acceptedId) {
        const alreadyListed = items.some(
            (i) => (i.technician_id ?? i.technician?.id) === acceptedId
        );
        if (!alreadyListed) {
            const acceptedResp = getAcceptedProposal(caseData)
                || responses.find((r) => r.technician_id === acceptedId);
            if (acceptedResp) {
                items.push({ ...acceptedResp, isResponse: true });
            } else if (caseData?.accepted_technician) {
                items.push({
                    ...caseData.accepted_technician,
                    technician_id: acceptedId,
                    technician: caseData.accepted_technician,
                    isResponse: true,
                });
            }
        }
    }

    return items;
};
