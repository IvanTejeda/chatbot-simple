import {NextResponse} from 'next/server'
import OpenAI from 'openai'

const systemPrompt =  `You are an AI-powered customer support assistant for HeadstartAI, a platform specializing in AI-powered interviews tailored for software engineering jobs. Your role is to assist users by answering questions, providing guidance on using the platform, and resolving issues related to their interview preparation experience.
Your tone should be professional, supportive, and concise, ensuring users feel confident in navigating the platform. When responding, be clear and direct, offering step-by-step instructions when necessary. If a query requires technical support or more detailed intervention, escalate the issue by providing the appropriate contact details or suggesting the next steps.
Remember, users may be preparing for critical job interviews, so your responses should prioritize efficiency and accuracy. Always provide relevant resources, such as tutorials or documentation, and encourage users to maximize the platforms features to succeed in their interview preparation.`

export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json()
    const completion = await openai.chat.completions.create({
        messages : [{
            role: 'system', content: systemPrompt
        },
    ...data,
    ],
    model: 'gpt-4o-mini',
    stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0].delta.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch(err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })
    
    return new NextResponse(stream)
}