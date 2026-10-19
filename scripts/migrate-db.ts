import {sqlClient} from '../server/database.ts';
import {migrations} from '../server/schema.ts';
const sql=sqlClient(true);
for(const statement of migrations)await sql.query(statement);
console.log('Database schema ready. No existing CV data changed.');
