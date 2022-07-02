/* book.js */

import { db } from 'db'

/**
 * Create Book for the librarian.
 * @param name
 * @param author
 * @param isbn
 * @param ddc
 * @param time_period
 * @param current_date
 * @param librarian_id
 * @returns true after creation of book
 */
export async function create_book(data) {
    let qty = data.quantity;
	for(let i =0; i<qty;i++){
		const sql = `INSERT INTO book(book_id, name, author, isbn, ddc, time_period, date, librarian_id) VALUES (UUID(),"${data.name}","${data.author}","${data.isbn}","${data.ddc}","${data.time_period}","${data.current_date}","${data.librarian_id}")`;
		console.log(sql)
		await db.query(sql)
	}
	return true
}

/**
 * Get Books for the librarian.
 * @returns js array of object
 */
export async function get_books() {
	let sql = `SELECT COUNT(*) as quantity, name, author,isbn from book GROUP by isbn,name,author;`
	let records = await db.query(sql)
	return records;
}

/**
 * Get Student information
 * @returns js array of object
 */
export async function get_students() {
	let sql = `SELECT id,user,count FROM accounts WHERE role=0;`
	let records = await db.query(sql)
	return records;
}

/**
 * Get student borrowed books record.
 * @param student_id
 * @returns js array of object
 */
export async function get_student_borrow(id) {
	let sql = `SELECT book.book_id,book.name, loan.return_date, loan.user_id from loan, book where loan.book_id=book.book_id AND loan.status=1 and loan.user_id = "${id}"`
	let records = await db.query(sql)
	return records;
}

/**
 * Update the loan, student and books after returning of book.
 * @param student_id
 * @param book_id(uuid)
 * @returns true after successful updating
 */
export async function return_borrow(book_id,id) {
	const sql = `UPDATE loan SET status=0 WHERE book_id="${book_id}" and user_id="${id}"`;
	await db.query(sql)

	const sql1 = `UPDATE accounts SET count=count-1 WHERE id="${id}"`;
	await db.query(sql1)

	const sql2 = `UPDATE book SET status=1 WHERE book_id="${book_id}"`;
	await db.query(sql2)
	return true;
}

/**
 * Update the student, books and insert into loan for borrowing of books.
 * @param student_id
 * @param book_id(uuid)
 * @returns true after successful updating
 */
export async function borrow_book(data) {
	const sqls = `SELECT * FROM book WHERE book_id="${data.uuid}";`
	let records = await db.query(sqls)

	if(records[0]){

		let days = records[0].time_period;
		var date = new Date();
		date.setDate(date.getDate() + days);
		let text = date.toString();
		let date1 = text.split(' ')[0] +" "+ text.split(' ')[1] +" "+ text.split(' ')[2] +" "+ text.split(' ')[3];
		console.log(text,data.current_date);

		if(records[0].status==1){
			const sql = `INSERT INTO loan(book_id, user_id, status, return_date) VALUES ("${data.uuid}","${data.user_id}",1,"${date1}")`;
			await db.query(sql)

			const sql2 = `UPDATE book SET status=0 WHERE book_id="${data.uuid}"`;
			await db.query(sql2)

			const sql1 = `UPDATE accounts SET count=count+1 WHERE id="${data.user_id}"`;
			await db.query(sql1)

		}
	}
	return true;
}