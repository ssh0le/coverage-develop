import React from "react";
//material UI
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
//custom
import CanvasContainer from "./CanvasContainer";
import DetailContainer from "./DetailContainer";
import IncisionContainer from "./IncisionContainer";
import Spinner from "../components/Spinner";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  spinner: {
    position: "absolute",
  },
}));

export default function App(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="stretch"
            spacing={2}
          >
            <Grid item xs={12}>
              <CanvasContainer />
            </Grid>
            <Grid item xs={12}>
              <DetailContainer />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={8}>
          <IncisionContainer />
        </Grid>
      </Grid>
      <Spinner />
    </div>
  );
}
