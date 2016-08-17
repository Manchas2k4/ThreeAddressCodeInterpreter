# Three Address Code Interpreter

The ThreeAddressCode Interpreter is a tool for running 3AC instructions in the browser. It is a true interpreter for Three Address Code Instructions. Instead of compiling from source language to machine language, it interprets directly in JavaScript.

## Get Started
1.	Download the latest version (Release details here)
2.	Setting up the Environment
3.	Building your First Program

**Setting up the Environment**

  Copy the ThreeAddressCode.min.js inside your working directory and insert the script tag inside your HTML document.

  ```html
<script type="txt/javascript" src="ThreeAddressCode.min.js" />
  ```

**Building your First Program**

  The following code segment will produce an alert with result 7.
  
  ```js
  var interpreter = new ThreeAddressCode();
  interpreter.run("print 3+4", [], function(out) {
	  alert(out);
  });
  ```
  
# Documentation

## Class ThreeAddressCode
 Takes Config object to configure the intepreter.
 
 **Syntax**
 
 ```js
 var interpreter = new ThreeAddressCode([config]);
 ```
 
## Methods
### .run()

Method to execute the code segment with the given inputs.

- **Parameters**

	####code  (string)
	
	Code lines separated by the separater defined in the config object
	####inputs (array)
		
	List of inputs referenced in the code segment from p0 to pn.
	####print (method)
		 
	Pipe stdout each time a print statement is hit, return Print Object.
	####error (method)
		 
	Handles error handling, return Error Object.
		 	
- **Syntax**

	```js
	interpreter->run(code, [inputs, [prints, [error]]]);
	```

- **Example**

	```js
	interpreter->run("print 3+4\nprint 2*3");
	```

### .run_line()

Method to execute a single code line with the given inputs.

- **Parameters**

	####code  (string)

	Code lines separated by the separater defined in the config object
	####inputs (array)
	
	List of inputs referenced in the code segment from p0 to pn.
	####print (method)

	Pipe stdout each time a print statement is hit, return Print Object.
	####error (method)

	Handles error handling, return Error Object.
	####clearHeap (boolean)
	
	Clears the heap memory to start from the beginning.
		 	
- **Syntax**

	```js
	interpreter->run_line(code, [inputs, [print, [error, [clearHeap]]]);
	```

- **Example**

	```js
	interpreter->run("print 3+4");
	```

### .add()

Method to add a single code line to the list of code lines.

- **Parameters**

	####code  (string)

	single code line.
		 	
- **Syntax**

	```js
	interpreter->add(code);
	```

- **Example**

	```js
	interpreter->add("print 3+9");
	```

### .get()

Method to retrieve variables from the heap or to evaluate expression. Returns the value of the varibale stored in heap or the result of an expression.

- **Parameters**

	####code  (string)

	single code line or a variable name
		 	
- **Syntax**

	```js
	interpreter->get(code);
	```

- **Example**

	```js
	interpreter->get("A");
	```

### .output()

Method to retrieve results of print statements. Returns list of print objects.
		 	
- **Syntax**

	```js
	interpreter->output();
	```

### .debug() [Development purposes only]

Method to retrieve Heap object from the memory. Debug property must be set in config object 
		 	
- **Syntax**

	```js
	interpreter->debug();
	```

