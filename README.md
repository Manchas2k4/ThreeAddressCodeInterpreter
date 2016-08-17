# Three Address Code Interpreter

The ThreeAddressCode Interpreter is a tool for running 3AC instructions in the browser. It is a true interpreter for Three Address Code Instructions. Instead of compiling from source language to machine language, it interprets directly in JavaScript.

## Get Started
	 1.	Download the latest version (Release details here)
	 2.	Setting up the Environment
	 3.	Building your First Program

**Setting up the Environment**

  Copy the ThreeAddressCode.min.js inside your working directory and insert the script tag inside your HTML document.

  ```
<script type="txt/javascript" src="ThreeAddressCode.min.js" />
  ```

**Building your First Program**

  The following code segment will produce an alert with result 7.
  
  ```
  var interpreter = new ThreeAddressCode();
  interpreter.run("print 3+4", [], function(out) {
	  alert(out);
  });
  ```
  
  
