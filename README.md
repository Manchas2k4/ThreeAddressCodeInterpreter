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


## Objects
### Config Object
####debug

  Shows additional information about errors, warnings, prints and program execution. Default value is false.
####stopOnError

  Stop execution if error occured in the code. Default value is false.
####separater

  Used to separate code lines inside code string. Default value is '\n'.
  
### Print Object
####val

  Contains the result of the expression with the print statement.
####line

  Contains the line number of the print statement.
  
### Error Object
####message

  Contains the Error message for readibility.
####line
  
  Contains the line number of the instruction that produced the error.
####code

  Contains an interger value unique to each error type.
  
  - 100	-	Undefined Variable
  - 101	-	Missing Operand
  - 102	-	Unknown operator
  - 104	-	Invalid Pointer Reference
  - 105	-	Invalid Type Conversion
  - 106	-	Undefined Label
  - 107	-	Invalid Method call
  - 108	-	Array index out of bound
  - 120	-	Unknown Error Type
 
##Executable Commands
###Expression
  Unary and Binary Operations with optional assignment. Variables can be pointers, references and indexed assignments.

####Binary Expression
  
  `[variable = ] expression operator expression`

####Unary Expression
  
  `[variable = ] operator expression`
  
####Indexed Expression
  
  `array[index] = expression`
  
####Pointer Expression

  ```
  variable2 = &variable1
  *variable2 = expression
  [variable3 =] *variable2
  ```
  
 ####Example
 
 ```js
 // Stores 7 in a
a = 3 + 4

// Stores 21 in b
b = a * 3

// Stores -21 in c
c = -b

// prints 63
9 * 7

// Create an array with only one index '0' with value '10'
arr[0] = 10

// makes 'h' a pointer pointing to the address of 'a'
h = &a

// modifies the value pointed to by 'h'
*h = 25
```

###Label
Identifier that identifies a labeled statement.

`label: [statement]`

####Example

```js
here: a = 6+7
```

###Jump
Unconditional jumps to a predefined label.

`goto label`

####Example

```js
here: print 8*7
...
goto here

```

###Flow Control
Determine the flow of control based on condition.

`if expression statement`

####Example

```js
if 5 > 3 print 1
```

###Methods
A method can be defined with the keyword BeginFunc and ended with EndFunc.

####BeginFunc methodname, n
Create a new method with the name 'methodname' and with number of acceptable parameters 'n'.

####EndFunc
Set the boundary for the method code segment. Everything between BeginFunc statement and EndFUnc statement is considered a part of the method body.

####param expression
Set a parameter to be passed to the method. Must be called before calling the method. Parameters can be accessed inside the method body with variable names from p0 to pn where n is the number of total parameters.

####call methodname, n
Calls a method with the name 'methodname' and acceptable parameters 'n'. The result returned by the method will be stored in the variable 'out' and will be retained until the next method call. Methods must be declared before calling. If there are more paramertes than required for calling the method, the paramertes added first will be send over to the method and removed.

####return [expression]
Halts the method execution and returns the value of the expression (if given).

####Syntax

```js
BeginFunc methodname, n
statements
EndFunc

param p0
param p1
...
param pn
call methodname, n
print out

```

####Example
This code segment defines a method that returns the multiplication of two numbers.

```js
BeginFunc sum, 2
return p0 * p1
EndFunc

param 6
param 7*5
call sum, 2
print out
```			
