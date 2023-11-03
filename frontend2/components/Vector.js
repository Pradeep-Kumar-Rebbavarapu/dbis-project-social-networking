class Vector {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  
    // Define vector operations like add, subtract, multiply, etc.
    add(vector) {
      this.x += vector.x;
      this.y += vector.y;
      return this;
    }
  
    subtract(vector) {
      this.x -= vector.x;
      this.y -= vector.y;
      return this;
    }
  
    // Other vector operations...
  
    // You can define methods like getLength, setLength, and rotate as needed.
    getLength() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
  
    setLength(length) {
      const currentLength = this.getLength();
      if (currentLength !== 0) {
        this.x *= length / currentLength;
        this.y *= length / currentLength;
      }
      return this;
    }
  
    rotate(angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x = this.x * cos - this.y * sin;
      const y = this.x * sin + this.y * cos;
      this.x = x;
      this.y = y;
      return this;
    }
  }
  
  export default Vector;
  