const BASE_URL = `${import.meta.env.VITE_API_URL}`;

export interface Task {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    priority: 'Low' | 'Medium' | 'High';
    dueDate: string | null;
    category: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskData {
    title: string;
    description?: string;
    completed?: boolean;
    priority?: 'Low' | 'Medium' | 'High';
    dueDate?: string;
    category?: string;
}

export const getTasks = async (): Promise<Task[]> => {
    const response = await fetch(`${BASE_URL}/tasks`);

    await handleResponse(response);

    return response.json();
};

export const createTask = async (
    taskData: CreateTaskData,
): Promise<Task> => {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
    });

    await handleResponse(response);

    return response.json();
};

export const updateTask = async (
    id: number,
    taskData: Partial<CreateTaskData>,
): Promise<Task> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
    });

    await handleResponse(response);

    return response.json();
};

export const deleteTask = async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
    });

    await handleResponse(response);
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        let message = 'Something went wrong';

        try {
            const data = await response.json();
            message = data.message || message;
        } catch {
            // Ignore invalid/empty response body
        }

        throw new Error(message);
    }

    return response;
};