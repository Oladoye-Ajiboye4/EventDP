import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL

const withAuthHeader = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
})

export const requestUploadSignature = async ({ token, userEmail, fileName }) => {
    const response = await axios.post(
        `${BASE_URL}createEventDP/upload-signature`,
        { userEmail, fileName },
        withAuthHeader(token),
    )

    return response.data?.data
}

export const uploadToCloudinary = async ({ signatureData, file }) => {
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('api_key', signatureData.apiKey)
    uploadFormData.append('timestamp', signatureData.timestamp)
    uploadFormData.append('signature', signatureData.signature)
    uploadFormData.append('folder', signatureData.folder)
    uploadFormData.append('public_id', signatureData.publicId)

    const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        uploadFormData,
    )

    return {
        publicId: response.data.public_id,
        secureUrl: response.data.secure_url,
        width: response.data.width,
        height: response.data.height,
        format: response.data.format,
        bytes: response.data.bytes,
        originalFilename: response.data.original_filename,
    }
}

export const createDraft = async ({ token, asset, editor, title }) => {
    const response = await axios.post(
        `${BASE_URL}createEventDP/drafts`,
        { asset, editor, title },
        withAuthHeader(token),
    )

    return response.data
}

export const autosaveDraft = async ({ token, draftId, editor, baseRevision, title }) => {
    const response = await axios.patch(
        `${BASE_URL}createEventDP/drafts/${draftId}/autosave`,
        {
            editor,
            baseRevision,
            title,
            lastClientEditAt: new Date().toISOString(),
        },
        withAuthHeader(token),
    )

    return response.data
}

export const publishDraft = async ({ token, draftId, editor, baseRevision, title, expiresAt }) => {
    const response = await axios.post(
        `${BASE_URL}createEventDP/drafts/${draftId}/publish`,
        {
            editor,
            baseRevision,
            title,
            expiresAt,
            lastClientEditAt: new Date().toISOString(),
        },
        withAuthHeader(token),
    )

    return response.data
}

export const getPublicEventDP = async ({ slug, projectSlug, accessKey }) => {
    const endpoint = accessKey
        ? `${BASE_URL}createEventDP/public/${projectSlug || 'eventdp'}/${accessKey}`
        : `${BASE_URL}createEventDP/public/${slug}`
    const response = await axios.get(endpoint)
    return response.data
}
