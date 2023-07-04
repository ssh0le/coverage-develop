import React, { Component } from "react";
// material UI
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const styles = {
    root: {
        display: "inline-block",
        marginRight: 10,
    },
    canvas: {
        border: "1px solid #000000",
    },
};

class Canvas extends Component {
    constructor(props) {
        super(props);
        this.canvas = React.createRef();
        this.state = {
            totalSquare: 0,
            totalSquareMin: 0,
            detailsSquare: 0,
        };
    }

    randomColor = () => {
        var allowed = "ABCDEF0123456789",
            S = "#";

        while (S.length < 7) {
            S += allowed.charAt(Math.floor(Math.random() * 16 + 1));
        }
        return S;
    };

    componentDidMount() {
        let ctx = this.canvas.current.getContext("2d");
        let totalSquare =
            this.props.canvasInfo.rootSizes.width *
            this.props.canvasInfo.rootSizes.height;
        let detailsSquare = 0;
        if (!this.props.canvasInfo.detailsSquare) {
            detailsSquare = this.props.canvasInfo.details.reduce(
                (accum, detail) => {
                    let width =
                        +detail.points.bottomRight.x - +detail.points.topLeft.x;
                    let height =
                        +detail.points.bottomRight.y - +detail.points.topLeft.y;

                    return accum + width * height;
                },
                0
            );
        } else {
            detailsSquare = this.props.canvasInfo.detailsSquare;
        }
        let detailsWithMinY = this.props.canvasInfo.details[0];
        let detailsWithMaxX = this.props.canvasInfo.details[0];

        //отрисовка здесь
        this.props.canvasInfo.details.forEach((detail) => {
            detailsWithMinY =
                detailsWithMinY.points.topLeft.y > detail.points.topLeft.y
                    ? detail
                    : detailsWithMinY;
            detailsWithMaxX =
                detailsWithMaxX.points.bottomRight.x <
                detail.points.bottomRight.x
                    ? detail
                    : detailsWithMaxX;
        });
        let totalSquareMin = this.props.canvasInfo.uselessFigureSquare
            ? this.props.canvasInfo.uselessFigureSquare * totalSquare
            : detailsWithMaxX.points.bottomRight.x *
              (this.props.canvasInfo.rootSizes.height -
                  detailsWithMinY.points.topLeft.y);

        this.setState({
            totalSquare,
            detailsSquare,
            totalSquareMin,
        });

        let maxX = 0;
        let maxY = 0;

        this.props.canvasInfo.details.forEach((detail) => {
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
            if (maxX < detail.points.bottomRight.x) {
                maxX = detail.points.bottomRight.x;
            }
            if (maxY < detail.points.bottomRight.y) {
                maxY = detail.points.bottomRight.y;
            }

            ctx.fillStyle = this.randomColor();
            ctx.fillRect(
                detail.points.topLeft.x,
                detail.points.topLeft.y,
                detail.points.bottomRight.x - detail.points.topLeft.x,
                detail.points.bottomRight.y - detail.points.topLeft.y
            );

            ctx.shadowColor = "#000000";
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 2;
            ctx.fillStyle = this.randomColor();
            ctx.strokeStyle = this.randomColor();
            ctx.font = "italic 11pt Arial";
            ctx.fillText(
                detail.id,
                detail.points.topLeft.x + 2,
                // detail.points.topLeft.x + 2,
                // detail.points.bottomRight.y - 2
                detail.points.bottomRight.y
            );
        });
        if (this.props.canvasInfo.uselessFigureSquare) {
            ctx.beginPath();
            ctx.lineWidth = "2"
            ctx.strokeStyle = "red";
            ctx.rect(0, 0, maxX, maxY);
            ctx.stroke();
        }
    }

    render() {
        const { classes, canvasInfo } = this.props;
        const { totalSquare, detailsSquare, totalSquareMin } = this.state;
        return (
            <div className={classes.root}>
                <Typography component='div' variant='subtitle2'>
                    Площадь изделий: {detailsSquare.toFixed(2)}
                </Typography>
                <Typography component='div' variant='subtitle2'>
                    Общая площадь: {totalSquare} | {totalSquareMin}
                </Typography>
                <Typography component='div' variant='subtitle2'>
                    Бесполезный материал:{" "}
                    {(totalSquare - detailsSquare).toFixed(2)} |{" "}
                    {(totalSquareMin - detailsSquare).toFixed(2)}
                </Typography>
                <canvas
                    className={classes.canvas}
                    width={canvasInfo.width}
                    height={canvasInfo.height}
                    ref={this.canvas}
                ></canvas>
            </div>
        );
    }
}

export default withStyles(styles)(Canvas);
