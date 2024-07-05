class Extranjero extends Persona
{
    constructor(id, nombre, apellido, edad, paisOrigen)
    {
        super(id, nombre, apellido, edad);
        this.paisOrigen = paisOrigen;
    }

    toString()
    {
        return `${super.toString()}, PaisOrigen: ${this.paisOrigen}`;
    }
}