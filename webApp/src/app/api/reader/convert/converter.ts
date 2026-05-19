import CloudConvert from 'cloudconvert';

const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY!);

/**
 * Converts a file buffer (PDF, DOC, DOCX) to EPUB using CloudConvert.
 * Returns the converted EPUB as a Buffer.
 */
export const convertToEpub = async (fileBuffer: Buffer, inputFileName: string): Promise<Buffer> => {
  const job = await cloudConvert.jobs.create({
    tasks: {
      'upload-source': {
        operation: 'import/upload',
      },
      convert: {
        operation: 'convert',
        input: ['upload-source'],
        output_format: 'epub',
      },
      'export-result': {
        operation: 'export/url',
        input: ['convert'],
      },
    },
  });

  const uploadTask = job.tasks.find((t) => t.name === 'upload-source');
  if (!uploadTask) throw new Error('CloudConvert: upload task not found in job');

  await cloudConvert.tasks.upload(uploadTask, fileBuffer, inputFileName);

  const completedJob = await cloudConvert.jobs.wait(job.id);

  const exportTask = completedJob.tasks.find((t) => t.name === 'export-result');
  const exportUrl = (exportTask?.result as any)?.files?.[0]?.url as string | undefined;
  if (!exportUrl) throw new Error('CloudConvert: export result URL not found');

  const response = await fetch(exportUrl);
  if (!response.ok) {
    throw new Error(`CloudConvert: failed to download result (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};
