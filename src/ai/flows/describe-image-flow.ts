"use server";
/**
 * @fileOverview An AI flow to describe an image for the EcoVend app.
 *
 * - describeImage - Analyzes an image and determines if it's recyclable.
 * - DescribeImageInput - The input type for the describeImage function.
 * - DescribeImageOutput - The return type for the describeImage function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const DescribeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an object, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DescribeImageInput = z.infer<typeof DescribeImageInputSchema>;

const DescribeImageOutputSchema = z.object({
  description: z
    .string()
    .describe("A description of the object in the image."),
  isRecyclable: z
    .boolean()
    .describe("Whether the object is a recyclable plastic bottle or can."),
});
export type DescribeImageOutput = z.infer<typeof DescribeImageOutputSchema>;

export async function describeImage(
  input: DescribeImageInput
): Promise<DescribeImageOutput> {
  return describeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: "describeImagePrompt",
  input: { schema: DescribeImageInputSchema },
  output: { schema: DescribeImageOutputSchema },
  prompt: `You are an expert at analyzing images for a recycling rewards app called EcoVend. Your task is to identify the object in the image and determine if it is a recyclable item, such as a plastic bottle or an aluminum can.

  Provide a brief description of the item.
  
  Then, determine if it is a recyclable bottle or can and set the isRecyclable field to true or false.

  Image: {{media url=photoDataUri}}`,
});

const describeImageFlow = ai.defineFlow(
  {
    name: "describeImageFlow",
    inputSchema: DescribeImageInputSchema,
    outputSchema: DescribeImageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
