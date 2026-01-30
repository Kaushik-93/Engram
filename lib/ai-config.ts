
export const AI_CONFIG = {
    // Default model for most tasks (fast, efficient)
    // Fallback to gemini-1.5-flash if not set
    defaultModel: process.env.GOOGLE_MODEL_DEFAULT || "gemini-3-flash-preview",

    // Model for complex reasoning (priming, evaluation)
    // Fallback to gemini-1.5-pro-exp-0827 or similar if needed, but using default for now
    reasoningModel: process.env.GOOGLE_MODEL_REASONING || "gemini-3-pro-preview",
};
