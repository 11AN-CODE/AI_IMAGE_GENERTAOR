export default async function handler(req, res) {
    const { model, inputs, parameters } = req.body;

    const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs, parameters, options: { wait_for_model: true } }),
        }
    );

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "image/png");
    res.send(Buffer.from(buffer));
}