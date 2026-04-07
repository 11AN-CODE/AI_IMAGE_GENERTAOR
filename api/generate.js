export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { model, inputs, parameters } = req.body;

    try {
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    inputs, 
                    parameters, 
                    options: { wait_for_model: true } 
                }),
            }
        );

        if (!response.ok) {
            const err = await response.json();
            return res.status(500).json({ error: err.error || "HF API failed" });
        }

        const buffer = await response.arrayBuffer();
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "no-store");
        res.send(Buffer.from(buffer));

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}