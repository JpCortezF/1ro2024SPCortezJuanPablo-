class Ciudadano extends Persona
{
    constructor(id, nombre, apellido, fecha, dni)
    {
        super(id, nombre, apellido, fecha);
        this.dni = dni;
    }

    toString()
    {
        return `${super.toString()}, DNI: ${this.dni}`;
    }

    toJson()
    {
        return JSON.stringify({
            id: this.id,
            nombre: this.nombre,
            apellido: this.apellido,
            fecha: this.fecha,
            dni: this.dni
        });
    }
}