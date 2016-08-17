/**
 *	Three Address Code Interpreter
 *
 *	Author: RITESH KUKREJA
 *	Website: https://riteshkukreja.wordpress.com
 *	Github: https://github.com/riteshkukreja
 *
 *	Executes 3AC commands and returns the result.
 *	Executable Commands
 *		- label: 
 *		- var = var|constant op var|constant
 *		- if expression expression
 *		- goto label
 *		- param expression
 *		- return expression
 *		- BeginFunc var, constant
 *		- EndFunc
 *		- call var, expression
 *		- var[i] indexed expression
 *		- *var pointers
 *		- &var address operator
 *		- print expression | expression
 *
 *
 *		********	************	********
 *			  **	**	 	  **	**
 *		********	************	**
 *			  **	**	 	  **	**
 *		********	**	 	  **	********
 */	

var ThreeAddressCode = function(config) {

	// List to store code lines
	var lines = [];

	// Heap Object to hold the defined variables
	var heap = {};

	// Object to store the method declarations
	var ops = {};

	// Object to store labels for jump instructions
	var index = {};

	// List to store parameters required for the execution
	var params = [];

	// Hold the print statements for outputting later
	var outputs = [];
	var stdout;
	var stderror;

	// Regular Expressions to determine the type of instructions
	var regex = {};
	regex['var'] = "[a-zA-Z][a-zA-Z0-9]*(\\[([0-9]+|[a-zA-Z][a-zA-Z0-9]*)\\])?";
	regex['constant'] = "[0-9]+";
	regex['op'] = "[\\*\\-\\+\\/\\&\\=\\<\\!\\>\\%]+";
	regex['goto'] = "(\\s+)?goto(\\s+)(" + regex.var + ")(\\s+)?";
	regex['exp'] = "(\\s+)?((((" + regex.var + ")|(" + regex.constant + "))?(\\s+)?(" + regex.op + ")(\\s+)?((" + regex.var + ")|(" + regex.constant + ")))|(" + regex.var + ")|(" + regex.constant + "))";
	regex['method'] = '(\\s+)?call\\s+(' + regex.var + ')(\\s+)?,(\\s+)?(' + regex.exp + ')(\\s+)?';
	regex['return'] = "(\\s+)?return(\\s+(" + regex.exp + "))?(\\s+)?";
	regex['print'] = "(\\s+)?print\\s+(" + regex.exp + ")(\\s+)?";
	regex['if'] = "(\\s+)?if\\s+(" + regex.exp + ")\\s+((" + regex.exp + ")|(" + regex.goto + ")|(" + regex.return + ")|(" + regex.print + "))(\\s+)?";
	regex['param'] = "(\\s+)?param\\s+(" + regex.exp + ")(\\s+)?";
	regex['def_method'] = '(\\s+)?BeginFunc\\s+(' + regex.var + ')(\\s+)?,(\\s+)?(' + regex.constant + ')(\\s+)?';
	regex['end_method'] = "(\\s+)?EndFunc(\\s+)?";

	// Method test instructions
	// Test if currently writing the code line inside of a function or executing
	var isMethodDef = false;

	// Store the name of the method currently exeuting
	var methodName = "root";

	// Store the methods as they execute
	var stack = [];


	// Operation Condition
	var debug = false;
	var stopOnError = false;
	var separater = '\n';

	// Handle Configuration Object
	if (typeof config == "object") {
		if(typeof config['debug'] != "undefined")
			debug = config['debug'];
		
		if(typeof config['stopOnError'] != "undefined")
			stopOnError = config['stopOnError'];

		if(typeof config['separater'] != "undefined")
			separater = config['separater'];
	}

	/**
	 *	RUN()
	 *
	 *	Main method to execute the code segment with the given inputs
	 *	Inputs is an list refrenced in the code segment from p0 to pn
	 * 	Output can be piped to a method stdout each time a print statement is hit
	 *	Errors can be handles separately using another callback
	 *	
	 * 	Example:
	 *	var obj = ThreeAddressCode();
	 *	obj->run(code, [inputs], prints, error); 
	 */
	this.run = function(code, stdin, callback, error) {

		// bring a clean slate
		heap = {};

		// Pipe the output
		if(typeof callback == "function")
			stdout = callback;

		// Pipe the error
		if(typeof error == "function")
			stderror = error;

		// Handle code segment
		if (typeof code == "string" && code.length > 0) {
			code = code.split(separater);
			lines = code;
		}

		// Handle Inputs
		if(typeof stdin == "object" && stdin.length > 0) {
			// Populate Input
			for (key in stdin) {
				heap['p' + key] = stdin[key];
			}
		}

		// Generate result
		if(lines.length > 0) {
			return build();
		}

		return false;
	}

	/**
	 *	RUN_LINE()
	 *
	 *	Secondary method to execute single code line.
	 *	Inputs is an list refrenced in the code segment from p0 to pn
	 * 	Output can be piped to a method stdout each time a print statement is hit
	 *	Errors can be handles separately using another callback
	 *	cleanHeap clears the memory and starts from the beginning with no variables and methods.
	 *	
	 * 	Example:
	 *	var obj = ThreeAddressCode();
	 *	obj->run_line(code, [inputs], prints, error, cleanHeap); 
	 */
	this.run_line = function(code, stdin, callback, error, clearHeap) {
		// bring a clean slate
		if(clearHeap) 
			heap = {};

		// Pipe the output
		if(typeof callback == "function")
			stdout = callback;

		// Pipe the error
		if(typeof error == "function")
			stderror = error;

		// Handle code segment
		if (typeof code == "string" && code.length > 0) {
			lines = [];
			lines.push(code);
		}

		// Handle Inputs
		if(typeof stdin == "object" && stdin.length > 0) {
			// Populate Input
			for (key in stdin) {
				heap['p' + key] = stdin[key];
			}
		}

		// Generate result
		if(lines.length > 0) {
			return build();
		}

		return false;
	}

	/**
	 *	ADD()
	 *
	 *	Method to add a single code line to the list of commands.
	 *	Used to create methods.
	 *	
	 * 	Example:
	 *	var obj = ThreeAddressCode();
	 *	obj->add(code); 
	 *	obj->run();
	 */
	this.add = function(line) {
		lines.push(line);
	}

	/**
	 *	GET()
	 *
	 *	Method to retrieve variables from the heap or to evaluate expression
	 *	
	 * 	Example:
	 *	var obj = ThreeAddressCode();
	 *	obj->get("a");
	 *	obj->get("3+4");
	 */
	this.get = function(v) {
		return evaluate(v);

		throw {'message': "Undefined variable '"+v + "'", 'code': 100};
	}

	/**
	 *	OUTPUT()
	 *
	 *	Method to retrieve results of print statements
	 *	
	 * 	Example:
	 *	var obj = ThreeAddressCode();
	 *	obj->output();
	 */
	this.output = function() {
		return outputs
	}

	/**
	 *	DEBUG()
	 *
	 *	Development purposes only
	 *	To peek under the hood of the regular expressions, heap, code segment, methods, parameter list
	 *	
	 * 	Example:
	 *	var obj = ThreeAddressCode();
	 *	obj->debug();
	 */
	this.debug = function() {
		if(!debug) return false;

		//console.log(regex, heap, lines, index, params, ops);
		return heap;
	}

	/**
	 *	isNumber()
	 *
	 *	Helper method to test if a given string is a number.
	 *	
	 */
	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	/**
	 *	isVar()
	 *
	 *	Helper method to test if a given string is a variable stored inside the heap
	 *	
	 */
	function isVar(n) {
		return (typeof heap[n] != "undefined");
	}

	/**
	 *	isMethod()
	 *
	 *	Helper method to test if a given string is a method.
	 *	
	 */
	function isMethod(n) {
		return (typeof ops[n] == "object");
	}

	/**
	 *	isIndexedVar()
	 *
	 *	Helper method to test if a given string is a variable and also an array ie supports indexing.
	 *	
	 */
	function isIndexedVar(n) {
		if(n.match(/\[.*\]/)) {
			// Indeed a index assignement
			return (typeof heap[n.substr(0, n.indexOf('['))] == "object");
		}
		
		return false;
	}

	/**
	 *	isPointer()
	 *
	 *	Helper method to test if a given string is a pointer inside the heap.
	 *	
	 */
	function isPointer(n, level) {
		// check if the variable exists to which this variable points to
		if(typeof level == "undefined" || level == 1) {
			if (isVar(n) && isVar(getVar(n))) return true;
		} else {
			return isVar(n) && isPointer(getVar(n), level-1);
		}
		return false;
	}

	/**
	 *	getVar()
	 *
	 *	Helper method to retrieve the value stored inside the heap if variable exists.
	 * 	It test the data for a constant, variable, indexed variable.
	 *	
	 */
	var getVar = function(id) {
		// Do a little cleaning
		id = id.replace(/\s+/, "");

		if (id.length == 0) 
			throw {'message': "Missing Operand", 'code': 101};

		// If constant
		if(isNumber(id)) 
			return parseFloat(id);

		// If variable
		if(isVar(id)) 
			return heap[id];

		// check for indexed assignments
		if(isIndexedVar(id)) {
			var index = evaluate(id.substr(id.indexOf('[')+1, id.indexOf(']')- 1 - id.indexOf('[')));
			var obj = heap[id.substr(0, id.indexOf('['))];

			if (typeof obj[parseFloat(index)] != "undefined")
				return obj[parseFloat(index)];

			throw {'message':  "Array index out of bound '" + id + "'", code: 108};
		}


		else throw {'message': "Unknown variable '"+ id + "'", 'code': 100};
	}

	/**
	 *	evaluate()
	 *
	 *	Helper method to evaluate an expression.
	 *	It handles Unary and Binary operations.
	 *	
	 */
	var evaluate = function(exp) {
		exp = exp.replace(/\s+/g, "");

		// determine if contains binary operation
		if(exp.match(regex.op)) {
			// get two variables
			var op = exp.match(regex.op)[0];
			var vars = exp.split(op);

			// check for unary operation
			if(vars[0].replace(/\s+/, "").length == 0 && vars[1].replace(/\s+/, "").length > 0) {
				// Univary operation
				// Only + and - are accepheap
				switch(op) {
					case "-": 	return -getVar(vars[1]);
					case "*": 	if(isPointer(vars[1], 1)) return getVar(getVar(vars[1]));
								break;
					case "&": 	if(isVar(vars[1])) return vars[1];
								break; 
					case "**": 	if(isPointer(vars[1], 2)) return getVar(getVar(getVar(vars[1])));
								break;
				}

				throw {'message': "Unknown operator '"+ op + "'", 'code': 102};
			}

			// evaluate expression
			try {
				switch(op) {
					case "+": 	return getVar(vars[0]) + getVar(vars[1]);
					case "-": 	return getVar(vars[0]) - getVar(vars[1]);
					case "*": 	return getVar(vars[0]) * getVar(vars[1]);
					case "/": 	return getVar(vars[0]) / getVar(vars[1]);
					case "%": 	return getVar(vars[0]) % getVar(vars[1]);
					case "==": 	return getVar(vars[0]) == getVar(vars[1]);
					case "<": 	return getVar(vars[0]) < getVar(vars[1]);
					case ">": 	return getVar(vars[0]) > getVar(vars[1]);
					case "!=": 	return getVar(vars[0]) != getVar(vars[1]);
					case "<=": 	return getVar(vars[0]) <= getVar(vars[1]);
					case ">=": 	return getVar(vars[0]) >= getVar(vars[1]);
				}

				throw {'message': "Unknown operator '"+ op + "'", 'code': 102};
			} catch (e) {
				// Rethrow the exception
				throw e;
			}

		} else {
			// check if a variable or constant
			return getVar(exp);
		}
	}

	/**
	 *	evalVar()
	 *
	 *	Helper method to evaluate an expression on the left side of the assignment.
	 *	It handles pointers and indexed assignments.
	 *	
	 */
	var evalVar = function(v, res) {
		// check the variable on the left side for index var, pointer
		if (v.indexOf("*") == 0) {
			// pointer type assignment
			// check if the variable exists to which this variable points to
			var pointerLevel = (v.match(/\*/g) || []).length;

			if (pointerLevel <= 2 && isPointer(v.substr(pointerLevel), pointerLevel)) {
				v = v.substr(pointerLevel);
				if(pointerLevel == 1)
					heap[heap[v]] = res;
				else
					heap[heap[heap[v]]] = res;
			}
			else
				throw {'message': "Invalid Pointer Reference '"+ v + "'", 'code': 104};
		} else if (v.match(/\[.*\]/)) {
			// Indexed assignment
			// check if variable is defined and a object
			if(isIndexedVar(v)) {
				// Definetly an indexed var
				// Update values
				heap[v.substr(0, v.indexOf("["))][v.substr(v.indexOf("[")+1, v.indexOf("]")-1-v.indexOf("["))] = res;
			} else {
				// check if it is not an object and defined var - throw an error (Incompatible type)
				if(isVar(v.substr(0, v.indexOf("["))))
					throw {'message': "Invalid Type Conversion - cannot convert integer '"+ v + "' to array", 'code': 105};

				// else create a new object
				heap[v.substr(0, v.indexOf("["))] = {};

				// Add values
				heap[v.substr(0, v.indexOf("["))][v.substr(v.indexOf("[")+1, v.indexOf("]")-1-v.indexOf("["))] = res;
			}
		} else {
			heap[v] = res;
		}
	}

	/**
	 *	handleSpecialExp()
	 *
	 *	Main Helper method to handle the code line.
	 *	It evaluates the expression on the right side as well as on the left side of the assinment.
	 *	It also handles special instructions like goto, param, call, BeginFunc, EndFunc etc.
	 * 	It emplyes Regular Expressions to to test and retrieve information from the instruction.
	 *	
	 */
	var handleSpecialExp = function(exp, line) {

		// Handle method code segment
		if(isMethodDef) {
			// check for method end
			if (exp.match(regex.end_method)) {
				// Handle method calls ending
				isMethodDef = false;
				methodName = '';

			} else {
				// push everything to the method
				ops[methodName].compiler.add(exp);
			}
			return false;
		} 

		//console.log(line, exp, exp.indexOf(":"), exp.substr(exp.indexOf(":")+1));

		// If label exists - remove it		
		if(exp.indexOf(":") != -1) {
			if(exp.length <= exp.indexOf(":")+1) return false;

			exp = exp.substr(exp.indexOf(":")+1);
		}

		// Check if expression is empty
		if(exp.replace(/\s+/g, "").length == 0) return false;


		if (exp.match(regex.if)) {
			// Handle if statement
			// extract conditions
			var cond = exp.match(regex.if)[2];
			var cond_res = evaluate(cond);

			// If result makes sense
			if(cond_res) {
				// extract process
				var task = exp.substr(exp.indexOf(cond) + cond.length);

				// do the given task
				handleSpecialExp(task, line);
			}

		} else if(exp.match(regex.print)) {
			// handle print statements
			var cond = exp.match(regex.print)[2];
			var cond_res = evaluate(cond);

			throw {"print": cond_res};

		} else if(exp.match(regex.return)) {
			// Handle return conditions

			// Extract conditions if exists
			var cond = exp.match(regex.return)[2];

			if(typeof cond != "undefined") {
				var cond_res = evaluate(cond);
				throw {"return": cond_res};
			}

			throw {"return": ""};

		}  else if (exp.match(regex.goto)) {
			// Handle Goto statements

			// Extract Label
			var label = exp.match(regex.goto)[3];

			// Check if label exists
			if(typeof index[label] != "undefined") {
				throw {"label": index[label]};
			} else {
				throw {'message': "Undefined Label '"+ label + "'", 'code': 106};
			}

		} else if (exp.match(regex.method)) {
			// handle function call

			// Extract the method name and params length
			var list = exp.match(regex.method);

			var method = list[2];
			var paramlength = list[7];

			// Check if method exists
			if(isMethod(method) && params.length >= paramlength) {

				// Generate param list
				attribs = params.slice(0, paramlength);

				// Remove first paramlength params
				params = params.slice(paramlength);

				// definitly a method
				var ret = ops[method].compiler.run("", attribs, stdout);

				// check for output
				if (typeof ret != "undefined")
					heap['out'] = ret;

			} else {
				throw {'message': "Invalid Method call '"+ method + "' with " + paramlength + " params", 'code': 107};
			}

		} else if (exp.match(regex.param)) {
			// Handle parameter list

			// Extract the conditions | value
			var cond = exp.match(regex.param)[2];

			// add to params list for the next function call
			params.push(evaluate(cond));

		} else if(exp.match(regex.def_method)) {
			// Handle method definition

			// Extract Method name and param length
			var list = exp.match(regex.def_method);
			var method = list[2];
			var paramlength = list[5];

			// Create a new Three Address Code Object to hold the method
			// ALso keep adding code segments until hit EndFunc
			ops[method] = {};
			ops[method]['compiler'] = new ThreeAddressCode;
			ops[method]['paramlength'] = paramlength;
			ops[method]['params'] = [];

			// To handle upcoming code segments
			isMethodDef = true;
			methodName = method;

		} else if (exp.match(regex.exp)) {
			// Handle expressions
			exp = exp.replace(/\s+/g, "");
			// divide it into variable and expression
			vars = exp.split('=');

			if(vars.length > 1)
				evalVar(vars[0], evaluate(vars[1]));
			else {

				var cond_res = evaluate(exp);
				throw {"print": cond_res};
			}
		}

		return true;
	}

	/**
	 *	build()
	 *
	 *	Main Helper method to handle initialization, sanitation and exception handling of the code segment.
	 *	This method is called automatically on execution.
	 *	
	 */
	var build = function() {
		// Take each line in code

		// Handle labels first
		for(var pos in lines) {
			var line = lines[pos];

			// check for labels
			if(line.indexOf(":") != -1) {
				// handle labels
				index[line.substr(0, line.indexOf(":")).replace(/\s+/, "")] = parseInt(pos);
				//lines[pos] = line.substr(line.indexOf(":")+1);
			}
		}

		var pos = 0;
		while(pos < lines.length) {
			var line = lines[pos];

			try {
				handleSpecialExp(line, pos);
			} catch(err) {
				if(typeof err == "object" && typeof err['label'] != "undefined") {
					// do a jump
					pos = err['label']-1;
					//return true;
				} else if(typeof err == "object" && typeof err['return'] != "undefined") { 
					return err['return'];
				} else if(typeof err == "object" && typeof err['print'] != "undefined") { 
					outputs.push({val:err['print'], line: pos+1});

					if (typeof stdout == "function")
						stdout({val:err['print'], line: pos+1});
				} else {
					if(typeof err == "object") {
						// standard errors
						err['message'] += " in line " + (pos+1);
						err['line'] = pos+1;
					} else {
						// unknown errors
						err = {'message': err, 'line': pos+1, 'code': 120};
					}

					if(typeof stderror == "function")
						stderror(err);

					if(debug) console.error(err);
					if(stopOnError) return;
				}
			}

			pos++;
		}

		return true;
	}
};