import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

interface MdxRowResult {
  uniqueName: string;
  caption: string;
  value: number | null;
}

const POWERSHELL_MAX_BUFFER = 10 * 1024 * 1024;

@Injectable()
export class MdxExecutorService {
  executeRowQuery(query: string): MdxRowResult[] {
    const adomdPath = process.env.SSAS_ADOMD_PATH;
    const server = process.env.SSAS_SERVER;
    const database = process.env.SSAS_DATABASE;

    if (!adomdPath || !server || !database) {
      throw new ServiceUnavailableException(
        'SSAS MDX execution is not configured. Set SSAS_ADOMD_PATH, SSAS_SERVER, and SSAS_DATABASE.',
      );
    }

    try {
      const output = execFileSync(
        'powershell',
        [
          '-NoProfile',
          '-ExecutionPolicy',
          'Bypass',
          '-File',
          this.findRunnerScriptPath(),
          '-Server',
          server,
          '-Database',
          database,
          '-AdomdPath',
          adomdPath,
          '-QueryBase64',
          Buffer.from(query, 'utf8').toString('base64'),
        ],
        {
          encoding: 'utf8',
          windowsHide: true,
          maxBuffer: POWERSHELL_MAX_BUFFER,
        },
      ).trim();

      if (!output) {
        return [];
      }

      const parsed = JSON.parse(output) as MdxRowResult | MdxRowResult[];
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      const reason =
        error instanceof Error && error.message ? ` ${error.message}` : '';
      throw new ServiceUnavailableException(
        `MDX execution failed against ${server}/${database}.${reason}`,
      );
    }
  }

  private findRunnerScriptPath() {
    const candidates = [
      path.resolve(process.cwd(), 'scripts/run-mdx.ps1'),
      path.resolve(process.cwd(), 'api/scripts/run-mdx.ps1'),
      path.resolve(__dirname, '../../../../../scripts/run-mdx.ps1'),
    ];

    const scriptPath = candidates.find((candidate) => existsSync(candidate));

    if (!scriptPath) {
      throw new ServiceUnavailableException(
        'Could not find the SSAS MDX PowerShell runner script.',
      );
    }

    return scriptPath;
  }
}
