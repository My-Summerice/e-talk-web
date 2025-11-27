import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

export interface DocumentInfo {
    id: string;
    filename: string;
    sessionId: string;
    uploadTime: string;
    size: number;
    chunkCount: number;
}

/**
 * 上传文档
 */
export async function uploadDocument(file: File, sessionId?: string): Promise<DocumentInfo> {
    const formData = new FormData();
    formData.append('file', file);
    if (sessionId) {
        formData.append('sessionId', sessionId);
    }

    const response = await axios.post(`${baseUrl}/ai/doc/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

/**
 * 获取指定会话的文档列表
 */
export async function getDocumentsBySession(sessionId: string): Promise<DocumentInfo[]> {
    const response = await axios.get(`${baseUrl}/ai/doc/list`, {
        params: { sessionId }
    });
    return response.data;
}

/**
 * 获取全局知识库文档列表（无 sessionId）
 */
export async function getKnowledgeBaseDocuments(): Promise<DocumentInfo[]> {
    const response = await axios.get(`${baseUrl}/ai/doc/list`, {
        params: { sessionId: '' }
    });
    return response.data;
}

/**
 * 删除单个文档
 */
export async function deleteDocument(documentId: string): Promise<string> {
    const response = await axios.delete(`${baseUrl}/ai/doc/${documentId}`);
    return response.data;
}

/**
 * 删除会话的所有文档
 */
export async function clearSessionDocuments(sessionId: string): Promise<string> {
    const response = await axios.delete(`${baseUrl}/ai/doc/session/${sessionId}`);
    return response.data;
}

/**
 * 删除所有文档（清空知识库）
 */
export async function clearAllDocuments(): Promise<string> {
    const response = await axios.delete(`${baseUrl}/ai/doc/all`);
    return response.data;
}
