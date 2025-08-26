'use server';
/**
 * @fileOverview A motivational message generator for the Audentia app.
 *
 * - generateMotivationalMessage - A function that generates an eco-friendly motivational message.
 * - GenerateMotivationalMessageInput - The input type for the generateMotivationalMessage function.
 * - GenerateMotivationalMessageOutput - The return type for the generateMotivationalMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GenerateMotivationalMessageInputSchema = z.object({
  points: z.number().describe('The number of points the user has earned.'),
});
export type GenerateMotivationalMessageInput = z.infer<typeof GenerateMotivationalMessageInputSchema>;

const GenerateMotivationalMessageOutputSchema = z.object({
  message: z.string().describe('The motivational message to display to the user.'),
  audioUri: z.string().optional().describe('The audio URI of the motivational message.'),
});
export type GenerateMotivationalMessageOutput = z.infer<typeof GenerateMotivationalMessageOutputSchema>;

export async function generateMotivationalMessage(input: GenerateMotivationalMessageInput): Promise<GenerateMotivationalMessageOutput> {
  return generateMotivationalMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'motivationalMessagePrompt',
  input: {schema: GenerateMotivationalMessageInputSchema},
  output: {schema: GenerateMotivationalMessageOutputSchema},
  prompt: `You are an AI assistant designed to provide eco-friendly motivational messages to users of the Audentia app. The app rewards users for recycling.

  The user currently has {{points}} points.

  Generate a short, positive message to encourage them to continue recycling. Be creative and make the user feel good about their positive impact on the environment.
  In addition to the message, create an audio version of the message using the multi-speaker setup and including your own voices.
  The message must be in less than 20 words.

  The speakers are named:
  - AudentiaBot: a kind human voice
  - EcoBot: a friendly robot voice

  Here's an example message:
  AudentiaBot: \"Great job!\"
  EcoBot: \"You've earned {{points}} points and helped the planet!\"
  AudentiaBot: \"Keep up the amazing work!\"\n`,
});

const generateMotivationalMessageFlow = ai.defineFlow(
  {
    name: 'generateMotivationalMessageFlow',
    inputSchema: GenerateMotivationalMessageInputSchema,
    outputSchema: GenerateMotivationalMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    // Generate audio from the motivational message
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: 'AudentiaBot',
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Algenib' },
                },
              },
              {
                speaker: 'EcoBot',
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Achernar' },
                },
              },
            ],
          },
        },
      },
      prompt: output!.message,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const audioUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {
      message: output!.message,
      audioUri: audioUri,
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
