import Population from "./evolution/Population";
import Gen from "./evolution/Gen";
import React from "react";
import { connect } from "react-redux";
//material UI
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
//custom
import Canvas from "./Canvas";
import BadDetails from "./BadDetails";
//utils
import {
    getTopLeftPointBySizeAndBottomLeftPoint,
    getBottomRightPointBySizeAndBottomLeftPoint,
    getSuitableDetailsForWidth,
    getSuitableDetailsForHeight,
} from "./AlgorithmsUtil";

import { withSnackbar } from "notistack";
import { isArguments } from "lodash";

const displaceResultToLeftUpCorner = (chromosome) => {
    const bulgingUpGen = chromosome.gens.sort(Gen.sortByBulgingUp)[0];
    const leftProtrudingGen = chromosome.gens.sort(Gen.sortByLeftProtruding)[0];
    chromosome.gens.forEach((gen) => {
        gen.x = gen.x - leftProtrudingGen.l.x;
        gen.y = gen.y - bulgingUpGen.l.y;
    });
    return chromosome;
};

const stabilizeResult = (result) => {
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
};

const createListOfGen = (gens) => {
    const gensCollection = [];
    gens.forEach((gen) => {
        for (let i = 1; i <= +gen.amount; i++) {
            gensCollection.push(new Gen(+gen.width, +gen.height));
            gensCollection.at(-1).outId = `${gen.id}-${i}`;
        }
    });
    return gensCollection;
};

const runEvolution = async (gens, chrWidth, chrHeight) => {
    const gensCollection = createListOfGen(gens);
    const startAlgorithTime = new Date();
    return new Population(gensCollection).startEvolution().then((result) => {
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
                chromosomeSquare: resultWithDetails.getChromosomeSquare(),
                freeSpace:
                    resultWithDetails.getChromosomeSquare() *
                    (1 - resultWithDetails.getFitness()),
                time: new Date() - startAlgorithTime,
            };
        } else {
            resultWithDetails.info = {
                chromosomeSquare: resultWithDetails.getChromosomeSquare(),
                time: new Date() - startAlgorithTime,
            };
        }
        return stabilizeResult(resultWithDetails);
    });
};

const styles = {
    listItem: {
        width: "100%",
    },
    colorWhite: {
        color: "#ffffff",
    },
};

class Evolution extends React.Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
        this.state = {
            canvasSizes: {
                width: 0,
                height: 0,
            },
            details: [],
            badDetails: [],
            canvases: [],
            factor: 1,
        };
    }

    componentDidMount() {
        let canvasWidth, canvasHeight, factor;
        if (this.props.settings.isAdaptiveCanvas) {
            canvasWidth = this.container.current.clientWidth;
            factor = canvasWidth / +this.props.canvas.width;
            canvasHeight = Math.round(factor * this.props.canvas.height);
        } else {
            canvasWidth = +this.props.canvas.width;
            canvasHeight = +this.props.canvas.height;
            factor = 1;
        }
        let detailedParts = [];
        this.props.details.forEach((detail) => {
            for (let index = 0; index < +detail.amount; index++) {
                detailedParts.push({
                    id: `${detail.id}-${index + 1}`,
                    width: Math.round(+detail.width * factor),
                    height: Math.round(+detail.height * factor),
                });
            }
        });

        this.setState(
            {
                ...this.state,
                canvasSizes: {
                    width: canvasWidth,
                    height: canvasHeight,
                },
                details: detailedParts,
                factor,
            },
            this.startAlgorithm
        );
    }
    //from 2d proj to coverage proj
    getDetailsFromChromo(chromosome) {
        const details = [];
        const difference = this.getMinXAndY(chromosome);
        chromosome.gens.forEach((gen) => {
            details.push({
                id: gen.outId,
                width: gen.width,
                height: gen.height,
                points: this.getStabilaizedPoints(gen.l, gen.width, gen.height, difference),
            });
        });
        return details;
    }

    getStabilaizedPoints(genL, width, height, difference) {
        const newTopLeft = {
            x: genL.x - difference.x,
            y: genL.y - difference.y,
        };
        return {
            topLeft: newTopLeft,
            bottomRight: { x: newTopLeft.x + width, y: newTopLeft.y + height },
        };
    }

    getMinXAndY(chromo) {
        let x = 100000, y = 100000;
        chromo.gens.forEach(gen => {
            if (gen.l.x < x) {
                x = gen.l.x;
            }
            if (gen.l.y < y) {
                y = gen.l.y;
            }
        })
        return {
            x, y
        }
    }

    getOriginalDetailsSquare(details) {
        let detailsSquare = details.reduce((accum, detail) => {
            return accum + +detail.width * +detail.height * +detail.amount;
        }, 0);
        return detailsSquare;
    }
    getActualDetailsSquare(details) {
        let detailsSquare = details.reduce((accum, detail) => {
            return accum + +detail.width * +detail.height;
        }, 0);
        return detailsSquare;
    }

    getDetailsFigureSquare(gens) {
        let x = 0, y = 0;
        gens.forEach(gen => {
            if (gen.points.bottomRight.x > x) {
                x = gen.points.bottomRight.x;
            }
            if (gen.points.bottomRight.y > y) {
                y = gen.points.bottomRight.y;
            }
        });
        return x * y;
    }

    getSquareMinPercent(gens, width, height) {
        const uselessSpace = this.getDetailsFigureSquare(gens);
        return uselessSpace / (width * height);
    }

    startAlgorithm = async () => {
        let startTime = Date.now();
        runEvolution(
            this.props.details,
            this.props.canvas.width,
            this.props.canvas.height
        ).then((data) => {
            //"data" is result of evolution algo
            let endTime = Date.now();
            let newCanvas = {
                details: this.getDetailsFromChromo(data),
                verifiableDetailsOnWidth: [],
                verifiableDetailsOnHeight: [],
                width: data.drawInfo.outerRectWidth,
                height: data.drawInfo.outerRectHeight,
                rootSizes: {
                    width: this.props.canvas.width,
                    height: this.props.canvas.height,
                },
                factor: 1,
                detailsSquare: this.getOriginalDetailsSquare(this.props.details),
            };
            const uselessFigureSquare =  this.getSquareMinPercent(newCanvas.details, data.drawInfo.outerRectWidth, data.drawInfo.outerRectHeight);
            newCanvas.uselessFigureSquare = uselessFigureSquare;
            this.setState(
                {
                    ...this.state,
                    canvases: [newCanvas],
                    badDetails: [],
                },
                () => {
                    this.props.dispatch({
                        type: "CLOSE_SPINNER",
                    });
                    this.props.enqueueSnackbar(
                        `Время выполнения ${endTime - startTime} мс`,
                        {
                            variant: "success",
                            autoHideDuration: 3000,
                            action: this.action,
                        }
                    );
                }
            );
        });
    };

    action = (key) => (
        <>
            <Button
                className={this.props.classes.colorWhite}
                onClick={() => {
                    this.props.closeSnackbar(key);
                }}
            >
                ОК
            </Button>
        </>
    );

    render() {
        const { canvases, badDetails } = this.state;

        return (
            <>
                <div ref={this.container}>
                    <BadDetails badDetails={badDetails} />
                    {canvases.map((canvas, index) => {
                        return <Canvas canvasInfo={canvas} key={index} />;
                    })}
                </div>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        canvas: state.canvas,
        details: state.details,
        settings: state.settings,
    };
};

export default withStyles(styles)(
    connect(mapStateToProps)(withSnackbar(Evolution))
);
