/* book.js */

import { db } from 'db'

/**
 * Get student borrowed books record.
 * @param student_id
 * @returns js array of object
 */
export async function get_student_books(id) {
	let sql = `SELECT  name, return_date from loan,book WHERE loan.status=1 and loan.book_id = book.book_id and loan.user_id=${id}`
	let records = await db.query(sql)
	return records;
}

/**
 * Get all books record.
 * @returns js array of object
 */
export async function get_all_books() {
	let sql = `SELECT * FROM (SELECT COUNT(*) as quantity, name, author,isbn from book GROUP by isbn,name,author) AS A JOIN (SELECT COUNT(*) as available, isbn as a from book where status=1 GROUP by a) AS B ON A.isbn=B.a`
	let records = await db.query(sql)
    return records;
}
