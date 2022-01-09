class Person:
  def __init__(self, fname, lname):
    self.firstname = fname
    self.lastname = lname

  def printname(self):
    print(self.firstname, self.lastname)

class Student1(Person):
  pass

class Student2(Person):
  def __init__(self, fname, lname):
    Person.__init__(self, fname, lname)

class Person:
  def __init__(self, fname, lname):
    self.firstname = fname
    self.lastname = lname

  def printname(self):
    print(self.firstname, self.lastname)

class Student3(Person):
  def __init__(self, fname, lname, year):
    super().__init__(fname, lname)
    self.graduationyear = year

  def welcome(self):
    print("Welcome", self.firstname, self.lastname, "to the class of", self.graduationyear)

x = Student3("Mike", "Olsen", 2019)
x.welcome()

x = Student1("Mike", "Olsen")
x.printname()

y = Student2("CS", "PUN")
y.printname()