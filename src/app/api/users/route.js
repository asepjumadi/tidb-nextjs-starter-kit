import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/tidb';

export class DataService {
  constructor() {
    this.pool = getConnection();
  }

  singleQuery(sql, ...args) {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, ...args, (err, results, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve({ results, fields });
        }
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.pool.end((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export async function GET(request) {
  const dataService = new DataService();

  try {
    const { results } = await dataService.singleQuery('SELECT * FROM users;');
    console.log('results', results);
    return NextResponse.json({ results },{status: 200});
  } catch (error) {
    return NextResponse.json({ error:'Database query failed',details:error.message }, { status: 500 });
  }
}
export async function POST(request) {
  const { name, email } = await request.json();

  if (!name || !email) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
  }

  const dataService = new DataService();

  try {
    const results = await dataService.singleQuery('INSERT INTO users (name, email) VALUES (?, ?);', [name, email]);
    return NextResponse.json({ results }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error:'Database query failed',details:error.message }, { status: 500 });
  }
}