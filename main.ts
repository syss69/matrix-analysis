/**
 * configuration
 */
const MATRIX_SIZE = 10;
const RANGE = { MIN: -100, MAX: 100 } as const;

/**
 * interfaces
 */
interface RowAnalysis {
  index: number;
  data: number[];
  minPositive: number | string;
  fixesNeeded: number;
  isGlobalMinRow: boolean;
}

interface MatrixAnalysisResult {
  matrix: number[][];
  globalMin: number;
  rows: RowAnalysis[];
}

/**
 * random number in range
 */
const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * matrix generation
 */
const generateMatrix = (size: number, min: number, max: number): number[][] =>
  Array.from({ length: size }, () =>
    Array.from({ length: size }, () => getRandomInt(min, max)),
  );

/**
 * calculation of minimum replacements
 */
const calculateFixes = (row: number[]): number => {
  let totalFixes = 0;
  let currentSequence = 1;

  for (let i = 1; i <= row.length; i++) { //logic: we count the length of the continuous sequence L and take floor(L / 3)
    const prevSign = Math.sign(row[i - 1]); 
    const currSign = i < row.length ? Math.sign(row[i]) || 1 : null;
    /*
    *according to the problem, we only check for positive and negative numbers, ignoring zeros. 
    *in this scenario (10x10 matrix with range [-100, 100]) the possibility of three zeros in a row is very low, so we can ignore it, but if we need to check for zeros, we can add the following logic:
    * const currSign = i < row.length ? Math.sign(row[i]) : null;
    * */
    if (currSign === prevSign) {
      currentSequence++;
    } else {
      totalFixes += Math.floor(currentSequence / 3);
      currentSequence = 1;
    }
  }

  return totalFixes;
};

/**
 * analysis of one row of the matrix
 */
const analyzeRow = (row: number[], index: number, globalMin: number): RowAnalysis => {
  const positives = row.filter((n) => n > 0);

  return {
    index,
    data: row,
    minPositive: positives.length > 0 ? Math.min(...positives) : "—", //if there are no positive numbers, we return "—"
    fixesNeeded: calculateFixes(row),
    isGlobalMinRow: row.includes(globalMin),
  };
};

/**
 * analysis of the entire matrix
 */
const analyzeMatrix = (matrix: number[][]): MatrixAnalysisResult => {
  const globalMin = Math.min(...matrix.flat());
  const rows = matrix.map((row, index) => analyzeRow(row, index, globalMin));

  return {
    matrix,
    globalMin,
    rows,
  };
};

/**
 * build table header
 */
const buildHeader = (size: number): string => {
  const columns = Array.from({ length: size }, (_, i) => i.toString().padStart(6)).join("");
  return `    ${columns}  | Мин.Пол | Замен`;
};

/**
 * output analysis result
 */
const printAnalysis = (result: MatrixAnalysisResult): void => {
  const { matrix, globalMin, rows } = result;
  const size = matrix.length;

  console.log(`\nАНАЛИЗ МАТРИЦЫ ${size}x${size} (Диапазон [${RANGE.MIN}..${RANGE.MAX}])`);
  console.log("=".repeat(95));

  console.log(buildHeader(size));
  console.log("-".repeat(95));

  rows.forEach((row) => {
    const marker = row.isGlobalMinRow ? "*" : " ";
    const rowContent = row.data.map((num) => num.toString().padStart(6)).join("");

    console.log(
      `${marker} [${row.index}]${rowContent} | ${row.minPositive
        .toString()
        .padStart(7)} | ${row.fixesNeeded.toString().padStart(5)}`,
    );
  });

  console.log("=".repeat(95));
  console.log(`* — строка с минимальным числом в матрице (${globalMin})`);
  console.log(
    "Замен — мин. кол-во замен для исключения трёх чисел подряд одного знака (+/+ /+ или -/-/-)\n",
  );
};

// entry point

const matrix = generateMatrix(MATRIX_SIZE, RANGE.MIN, RANGE.MAX);
const analysisResult = analyzeMatrix(matrix);
printAnalysis(analysisResult);
