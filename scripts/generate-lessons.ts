import fs from 'node:fs/promises';
import path from 'node:path';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { LessonManifestSchema } from '../src/engine/schema';
import { evaluateProjectileLesson } from '../src/widgets/ProjectileSim/ProjectileSim.eval';

async function main() {
  const seedPath = path.resolve(
    __dirname,
    '../src/lessons/seeds/hsc-phy-p1-ch3-projectile-01.json'
  );
  const seedRaw = await fs.readFile(seedPath, 'utf8');
  let feedback = '';

  for (let attempt = 1; attempt <= 3; attempt++) {
    const { object } = await generateObject({
      model: google('gemini-2.5-pro'),
      schema: LessonManifestSchema,
      prompt: [
        'Generate a new progressive SSC/HSC Physics ProjectileSim 6-Card Lesson variation.',
        'Preserve strict NCTB Physics 1st Paper Ch. 3 conventions and bilingual EN + Bangla prompts.',
        `Reference Seed JSON:\n${seedRaw}`,
        feedback ? `Previous attempt failed Evals — fix these errors:\n${feedback}` : '',
      ].join('\n\n'),
    });

    const evalCheck = evaluateProjectileLesson(object);
    if (evalCheck.passed) {
      const outPath = path.resolve(
        __dirname,
        `../src/lessons/generated/${object.lessonId}.json`
      );
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      await fs.writeFile(outPath, JSON.stringify(object, null, 2));
      console.log(`Saved Eval-verified lesson -> ${outPath}`);
      return;
    }
    feedback = evalCheck.errors.join('\n');
    console.warn(`Attempt ${attempt} failed Gate 2 Eval:\n${feedback}`);
  }
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
