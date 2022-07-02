
/* routes.js */

import { Router } from 'oak'
import { Handlebars } from 'handlebars'

import { login, register } from 'accounts'
import { create_book, get_books, get_students,get_student_borrow,return_borrow, borrow_book } from './modules/book.js'
import { get_all_books, get_student_books } from './modules/student.js'

const handle = new Handlebars({ defaultLayout: '' })
const router = new Router()

// the routes defined here

// Route for the home page.
router.get('/', async context => {
	const authorised = await context.cookies.get('authorised')
	const data = { authorised }
	const body = await handle.renderView('home', data)
	context.response.body = body
})

// Route for the login page.
router.get('/login', async context => {
	const body = await handle.renderView('login')
	context.response.body = body
})

// Route for the register page.
router.get('/register', async context => {
	const body = await handle.renderView('register')
	context.response.body = body
})

// Route for the student record where url parameter is id
router.post('/student-info', async context => {

	// Getting form input
	const body = context.request.body({ type: 'form' })
	const value = await body.value
	const obj = Object.fromEntries(value)
	let id= obj.id;

	
	
	// Checking if the user is authoried
	const authorised = context.cookies.get('authorised')
	if(authorised === undefined) context.response.redirect('/')

	// Getting record from the context cookies
	let data = await authorised.then(function(value){
		return value;
	})

	// Checking if the user is librarian
	if(data[2]==1){
		console.log(obj.book_id)
		if(obj.book_id){
			let book_id = obj.book_id;
			const return_record = await return_borrow(book_id,id);
		}
		
		const borrow_record = await get_student_borrow(id);
		const body = await handle.renderView('student-record', {borrow_record,id})
		context.response.body = body
	}
	// Else route to home page
	else{
		context.response.redirect('/')
	}
})



// Route for the student record for borrowing of books
router.post('/student-record', async context => {

	// Getting data from the form
	console.log('POST /student-record')
	const body = context.request.body({ type: 'form' })
	const value = await body.value
	const obj = Object.fromEntries(value)

	// Checking if the user exists or authoried
	const authorised = context.cookies.get('authorised')
	if(authorised === undefined) context.response.redirect('/')

	// Fetching cookies values
	let data = await authorised.then(function(value){
		return value;
	})

	// Checking if the user is librarian
	if(data[2]==1){
		let id = obj.user_id;
		const borrow = await borrow_book(obj);
		const borrow_record = await get_student_borrow(id);
		
		const body = await handle.renderView('student-record', {borrow_record,id})
		context.response.body = body
	}
	// Otherwise route to home page
	else{
		context.response.redirect('/')
	}
})

// Route for registering the new user
router.post('/register', async context => {

	// Fetching the POSTED form data
	console.log('POST /register')
	const body = context.request.body({ type: 'form' })
	const value = await body.value
	const obj = Object.fromEntries(value)

	// Adding the data to database 
	await register(obj)

	// Route to the login page after registering
	context.response.redirect('/login')
})

// Logging out the user
router.get('/logout', async context => {

	// Deleting the cookies 
  	await context.cookies.delete('authorised')

	// Routing to the home page
  	context.response.redirect('/')
})


// Route for the user login
router.post('/login', async context => {

	// Fetching record from the posted form
	console.log('POST /login')
	const body = context.request.body({ type: 'form' })
	const value = await body.value
	const obj = Object.fromEntries(value)
	
	// If the log in is true, add the necassary info in cookies
	try {
		const [id, role] = await login(obj)
		console.log(id,role)
		await context.cookies.set('authorised', [id,role])

		// Router the user to its portal
		context.response.redirect('/user')
	} catch(err) {

		// Router the user to its login, if credentials are wrong
		console.log(err)
		context.response.redirect('/login')
	}
})

// Router for the creation of new book
router.post('/book', async context => {

	// Fetching the record from the posted form
	console.log('POST /book')
	const body = context.request.body({ type: 'form' })
	const value = await body.value
	const obj = Object.fromEntries(value)
	
	// Checking if everything is good, router to user page
	try {
		const value = await create_book(obj)
		console.log(value)
		context.response.redirect('/user')
	} catch(err) {
		console.log(err)
		context.response.redirect('/user')
	}
})

// After logging in, router will do necassary steps here:
router.get('/user', async context => {

	// Checking if user is authorized
	const authorised = context.cookies.get('authorised')
	if(authorised === undefined) context.response.redirect('/')
	
	// Getting info from cookies
	let data = await authorised.then(function(value){
		return value;
	})

	// if user is authoried, and student, route to student page
	if(data[2]==0){
		const id = data[0];
		const student_books = await get_student_books(id);
		const all_books = await get_all_books();

		const body = await handle.renderView('student', {student_books,all_books})
		context.response.body = body
	}
	// if user is authoried, and librarian, route to librarian page
	else if(data[2]==1){
		const books = await get_books();
		console.log(books)
		const body = await handle.renderView('librarian', {books})
		context.response.body = body
	}
	// Route to the home page otherwise
	else{
		context.response.redirect('/')
	}
})

// Route for taking the user to add-book page after validation
router.get('/add-book', async context => {
  	const authorised = context.cookies.get('authorised')
	if(authorised === undefined) context.response.redirect('/')
	
	let data = await authorised.then(function(value){
		return value;
	})
	const id = data[0];
	
	if(data[2]==1){
		const body = await handle.renderView('add-book', {id})
		context.response.body = body
	}else{
		context.response.redirect('/')
	}
})

// Router for taking the user to manage user page
router.get('/manage-user', async context => {

	// Checking if the user is authorised
  	const authorised = context.cookies.get('authorised')
	if(authorised === undefined) context.response.redirect('/')
	
	// Fetching the data from cookies
	let data = await authorised.then(function(value){
		return value;
	})

	// Checking if the user is librarian
	if(data[2]==1){
		const students = await get_students();
		console.log(students)
		const body = await handle.renderView('manage-user', {students})
		context.response.body = body
	}else{
		context.response.redirect('/')
	}
})

export default router
