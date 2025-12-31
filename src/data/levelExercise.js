export const levelExerciseContent = {
  id: "level",
  title: "Ejercicio: Analizador de Estudiantes",
  type: "exercise",
  content: {
    instructions: `Crea una función \`analizarNotas(estudiantes)\` que reciba un array de objetos. Cada objeto representa a un estudiante:

{
  nombre: "Juan",
  notas: [8, 7, 9]
}

La función debe:
1. Calcular el promedio de cada estudiante (suma de notas / número de notas) y redondearlo a 2 decimales.
2. Determinar su estado:
   - "Aprobado" si promedio >= 6
   - "Suspenso" si promedio < 6
3. Devolver un nuevo array con objetos que contengan nombre, promedio y estado.

Ejemplo de uso:

const estudiantes = [
  { nombre: "Ana", notas: [7, 8, 9] },
  { nombre: "Luis", notas: [5, 4, 6] }
];

console.log(analizarNotas(estudiantes));

Resultado esperado:

[
  { nombre: "Ana", promedio: 8, estado: "Aprobado" },
  { nombre: "Luis", promedio: 5, estado: "Suspenso" }
]

Restricciones:
- No usar librerías externas.`,
    preconditions: [
      "El parámetro estudiantes será siempre un array válido de objetos.",
      "Cada objeto tendrá propiedades nombre (string) y notas (array de números).",
      "El array puede estar vacío."
    ],
    postconditions: [
      "Devuelve un array con objetos que contengan nombre, promedio y estado.",
      "Por cada estudiante en el array recibido como parámetro, se debe crear un objeto en el array resultante.",
      "El nombre es el mismo nombre recibido en el objeto estudiante original.",
      "El promedio se calcula como: suma de todas las notas / número de notas.",
      "El promedio debe estar redondeado a 2 decimales.",
      "El estado es 'Aprobado' si promedio >= 6, o 'Suspenso' si promedio < 6.",
      "No modifica el array original."
    ],
    functionName: "analizarNotas",
    starterCode: `function analizarNotas(estudiantes) {
  // Escribe tu código aquí
}

// Prueba tu código
const estudiantes = [
  { nombre: "Ana", notas: [7, 8, 9] },
  { nombre: "Luis", notas: [5, 4, 6] }
];

console.log(analizarNotas(estudiantes)); 
// Debe retornar: [
//   { nombre: "Ana", promedio: 8, estado: "Aprobado" },
//   { nombre: "Luis", promedio: 5, estado: "Suspenso" }
// ]`,
    mainCode: "",
    solution: `function analizarNotas(estudiantes) {
  const resultado = [];

  for (let i = 0; i < estudiantes.length; i++) {
    const estudiante = estudiantes[i];
    const notas = estudiante.notas;
    let suma = 0;

    for (let j = 0; j < notas.length; j++) {
      suma += notas[j];
    }

    let promedio = suma / notas.length;
    promedio = Math.round(promedio * 100) / 100; // redondear a 2 decimales

    const estado = promedio >= 6 ? "Aprobado" : "Suspenso";

    resultado.push({
      nombre: estudiante.nombre,
      promedio: promedio,
      estado: estado
    });
  }

  return resultado;
}`,
    forbiddenFunctions: ["map", "reduce", "toFixed"],
    tests: [
      {
        input: [
          { nombre: "Ana", notas: [7, 8, 9] },
          { nombre: "Luis", notas: [5, 4, 6] }
        ],
        expected: [
          { nombre: "Ana", promedio: 8, estado: "Aprobado" },
          { nombre: "Luis", promedio: 5, estado: "Suspenso" }
        ]
      },
      {
        input: [
          { nombre: "Pedro", notas: [10, 9, 10] },
          { nombre: "Maria", notas: [6, 6, 6] },
          { nombre: "Jorge", notas: [3, 4, 2] }
        ],
        expected: [
          { nombre: "Pedro", promedio: 9.67, estado: "Aprobado" },
          { nombre: "Maria", promedio: 6, estado: "Aprobado" },
          { nombre: "Jorge", promedio: 3, estado: "Suspenso" }
        ]
      },
      {
        input: [
          { nombre: "Lucía", notas: [5.555, 6.666, 7.777] }
        ],
        expected: [
          { nombre: "Lucía", promedio: 6.67, estado: "Aprobado" }
        ]
      },
      {
        input: [
          { nombre: "Tomás", notas: [0, 0, 0] }
        ],
        expected: [
          { nombre: "Tomás", promedio: 0, estado: "Suspenso" }
        ]
      },
      {
        input: [
          { nombre: "Eva", notas: [6, 6, 5.9] },
          { nombre: "Luis", notas: [5.99, 6, 6.01] }
        ],
        expected: [
          { nombre: "Eva", promedio: 5.97, estado: "Suspenso" },
          { nombre: "Luis", promedio: 6, estado: "Aprobado" }
        ]
      },
      {
        input: [],
        expected: []
      }
    ]
  }
};