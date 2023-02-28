import Population from "../components/algorithms/evolution/Population.js";
import Gen from "../components/algorithms/evolution/Gen.js";

// eslint-disable-next-line import/no-anonymous-default-export
export default async () => {
    
    async function runEvolution(gens, chrWidth, chrHeight) {
        console.log(gens, chrWidth, chrHeight);
        const gensCollection = createListOfGen(gens);
        const startAlgorithTime = new Date();
        return new Population(gensCollection)
            .startEvolution()
            .then((result) => {
                const resultWithDetails = displaceResultToLeftUpCorner(
                    result[result.length - 1]
                );
                resultWithDetails.drawInfo = {
                    outerRectHeight: chrHeight,
                    outerRectWidth: chrWidth,
                    widthToDraw:
                        resultWithDetails.width > chrWidth
                            ? resultWithDetails.width
                            : chrWidth,
                    heightToDraw:
                        resultWithDetails.height > chrHeight
                            ? resultWithDetails.height
                            : chrHeight,
                };
                if (resultWithDetails.gens.length > 1) {
                    resultWithDetails.info = {
                        fitness: resultWithDetails.getFitness(),
                        chromosomeSquare:
                            resultWithDetails.getChromosomeSquare(),
                        freeSpace:
                            resultWithDetails.getChromosomeSquare() *
                            (1 - resultWithDetails.getFitness()),
                        time: new Date() - startAlgorithTime,
                    };
                } else {
                    resultWithDetails.info = {
                        chromosomeSquare:
                            resultWithDetails.getChromosomeSquare(),
                        time: new Date() - startAlgorithTime,
                    };
                }
                console.log(resultWithDetails);
                return stabilizeResult(resultWithDetails);
            });
    }
    function createListOfGen(gens) {
        const gensCollection = [];
        gens.forEach((gen) => {
            for (let i = 1; i <= +gen.amount; i++) {
                const gen = new Gen();
                gensCollection.push(new Gen(+gen.width, +gen.height));
                gensCollection.at(-1).outId = `${gen.id}-${i}`;
            }
        });
        return gensCollection;
    }
    function displaceResultToLeftUpCorner(chromosome) {
        const bulgingUpGen = chromosome.gens.sort(Gen.sortByBulgingUp)[0];
        const leftProtrudingGen = chromosome.gens.sort(
            Gen.sortByLeftProtruding
        )[0];
        chromosome.gens.forEach((gen) => {
            gen.x = gen.x - leftProtrudingGen.l.x;
            gen.y = gen.y - bulgingUpGen.l.y;
        });
        return chromosome;
    }
    function stabilizeResult(result) {
        const xMultiplier =
            (1000 / result.drawInfo.widthToDraw) *
            (result.drawInfo.widthToDraw / result.drawInfo.heightToDraw);
        const yMultiplier = 1000 / result.drawInfo.heightToDraw;
        result.drawInfo = {
            outerRectHeight: result.drawInfo.outerRectHeight * yMultiplier,
            outerRectWidth: result.drawInfo.outerRectWidth * xMultiplier,
            widthToDraw: result.drawInfo.widthToDraw * xMultiplier,
            heightToDraw: result.drawInfo.heightToDraw * yMultiplier,
        };
        result.gens.forEach((gen) => {
            gen.width = gen.width * xMultiplier;
            gen.height = gen.height * yMultiplier;
            gen.x = gen.x * xMultiplier;
            gen.y = gen.y * yMultiplier;
            gen.l.x = gen.l.x * xMultiplier;
            gen.l.y = gen.l.y * yMultiplier;
            gen.r.x = gen.r.x * xMultiplier;
            gen.r.y = gen.r.y * yMultiplier;
        });
        return result;
    }
    // eslint-disable-next-line no-restricted-globals
    self.onmessage = async function (e) {
        console.log("worker received data: ");
        console.log(e.data);
        runEvolution(e.data.details, e.data.width, e.data.height).then(
            (data) => {
                postMessage(data);
            }
        );
    };
};
