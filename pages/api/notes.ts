import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'notes.json');

interface NotesData {
  [tableKey: string]: {
    [columnName: string]: string;
  };
}

interface NotesResponse {
  success: boolean;
  data?: NotesData;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NotesResponse>
) {
  try {
    if (req.method === 'GET') {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const notes: NotesData = JSON.parse(data);

      return res.status(200).json({
        success: true,
        data: notes,
      });
    }

    if (req.method === 'POST') {
      const { tableKey, notes } = req.body;

      if (!tableKey || !notes) {
        return res.status(400).json({
          success: false,
          error: 'tableKey and notes are required',
        });
      }

      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const allNotes: NotesData = JSON.parse(data);

      allNotes[tableKey] = notes;

      fs.writeFileSync(DATA_FILE, JSON.stringify(allNotes, null, 2));

      return res.status(200).json({
        success: true,
        data: allNotes,
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  } catch (error) {
    console.error('Error handling notes:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
