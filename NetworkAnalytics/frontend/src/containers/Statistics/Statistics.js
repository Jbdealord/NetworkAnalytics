import React, { Component } from 'react';

import moment from 'moment';

import { withRouter } from 'react-router-dom';

import { connect } from 'react-redux';

import classNames from 'classnames';

import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';

import LineChartUD from '../../components/LineChart/LineChartUD';
import LineChartLatency from '../../components/LineChart/LineChartLatency';
import { Line } from 'recharts';
import DateSetting from '../../components/DateSetting/DateSetting';

import { delModule, getStats } from '../../store/actions/index';

const styles = theme => ({
  root: {
    width: '100%',
  },
  headerPadding: {
    paddingTop: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 4,
    paddingBottom: theme.spacing.unit * 2,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary,
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2,
  },
  mainPaper: {
    marginBottom: theme.spacing.unit * 2
  },
  button: {
    flexDirection: 'rowReverse'
  },
  date: {
    fontSize: theme.spacing.unit * 2.5,
  },
  dividerMargin: {
    marginTop: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit,
  }
});

class statistics extends Component {
  constructor (props) {
    super(props);
    this.state = {
      event_start_date: moment.unix((this.props.data[0] || '').event_start_time).format('YYYY-MM-DD') || '',
      event_start_date_unix: (this.props.data[0] || '').event_start_time,
      event_end_date: moment.unix((this.props.data[this.props.data.length - 1] || '').event_end_time).format('YYYY-MM-DD') || '',
      event_end_date_unix: (this.props.data[this.props.data.length - 1] || '').event_end_time,
      average_down_time: '',
      average_up_time: '',
      average_packet_loss: '',
      dialogue_open: false,
    };
  };

  componentDidMount () {
    // console.log("Statistics properties");
    // console.log(this.props);
    this.fetchStatsHandler();
  };

  fetchStatsHandler = () => {
    const data = {
      device_name: this.props.id,
      start_date: this.state.event_start_date,
      end_date: this.state.event_end_date,
    };
    this.props.getStats(data);
  };

  openDialogueHandler = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        dialogue_open: true
      };
    });
  };

  dialogueCloseHandler = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        dialogue_open: false
      };
    });
  };

  deleteModuleHandler = () => {
    this.dialogueCloseHandler();
    const url_fetch = 'http://nalvp.pythonanywhere.com/deleteInfo/';
    const data = {
      device_name: this.props.id,
      // start_date: this.state.event_start_date,
      // end_date: this.state.event_end_date,
    };
    fetch(url_fetch, {
      method: 'POST',
      body: JSON.stringify(data),
      headers:{
          'Content-Type': 'application/json'
      }
    })
      .catch(err => {
          console.log(err);
      })
      .then(res => {
        // console.log(res);
          if(res === undefined){
              throw Error;
          }
          return res.json();
      })
      .then(parsedRes => {
        // console.log(parsedRes);
      })
      .catch(err => {
        console.log(err);
        Promise.resolve(err);
      })
    this.props.delModule(this.props.id);
    if(this.props.modules.length > 1){
      this.props.history.push({pathname: '/dashboard/' + 
        this.props.modules.filter(item => {
          return item.device_name !== this.props.id;
        })[0].device_name
      });
    }
    else {
      this.props.history.push('/uploadData/');
    }
  };

  handleChangeStart = date => {
    if(date.unix() > this.state.event_end_date_unix){
      alert("End date is further than the start date.");
    }
    else
    {
      this.setState(prevState => {
        return {
          ...prevState,
          event_start_date: date.format('YYYY-MM-DD'),
          event_start_date_unix: date.unix(),
        };
      });
    }
  };

  handleChangeEnd = dateEnd => {
    if(dateEnd.unix() < this.state.event_start_date_unix){
      alert("End date is further than the start date.");
    }
    else
    {
      this.setState(prevState => {
        return {
          ...prevState,
          event_end_date: dateEnd.format('YYYY-MM-DD'),
          event_end_date_unix: dateEnd.unix(),
        };
      });
    }
  };

  render() {
    const { classes } = this.props;
    const indMod = this.props.individualModule.find(item => {
      return this.props.id === item.device_name;
    });
    // console.log(indMod);
    // console.log("ind module");
    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={10}>
            <Typography variant="display3">
              {this.props.id}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Tooltip id="tooltip-icon" title="Delete Module">
              <IconButton onClick={this.openDialogueHandler} className={classNames(classes.button, classes.date)} aria-label="Close">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
              <Dialog
                open={this.state.dialogue_open}
                onClose={this.dialogueCloseHandler}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle 
                  id="alert-dialog-title"
                >
                  {"Are you sure you want to delete the module?"}
                </DialogTitle>
                <DialogActions>
                  <Button onClick={this.dialogueCloseHandler} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={this.deleteModuleHandler} color="primary" autoFocus>
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
          </Grid>
        </Grid>
        <DateSetting 
          event_start_date_unix = {this.state.event_start_date_unix}
          event_end_date_unix = {this.state.event_end_date_unix}
          handleChangeStart = {this.handleChangeStart}
          handleChangeEnd = {this.handleChangeEnd}
          fetchStatsHandler = {this.fetchStatsHandler}
          minDate = {moment.unix((this.props.data[0] || '').event_start_time).format('YYYY-MM-DD')}
          maxDate = {moment.unix((this.props.data[this.props.data.length - 1] || '').event_end_time).format('YYYY-MM-DD')}
        />
        <Grid container spacing={24}>
          <Grid item xs={4}>
            <Paper className={classes.paper}>
              <Typography variant="subheading">Average Up Time</Typography>
              <Typography variant="display2">{(Math.round(indMod.average_up_time * 1000000)/10000 + '%')}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className={classes.paper}>
              <Typography variant="subheading">Average Down Time</Typography>
              <Typography variant="display2">{(Math.round(indMod.average_down_time * 1000000)/10000 + '%')}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className={classes.paper}>
              <Typography variant="subheading">Average Packet Loss</Typography>
              <Typography variant="display2">{indMod.average_packet_loss + '%' || 0 + '%'}</Typography>
            </Paper>
          </Grid>
        </Grid>
        <Paper className={classes.mainPaper}>
          <Typography className={classes.headerPadding} variant="headline">
            Up/Down Time
          </Typography>
          <LineChartUD 
            data={
            this.props.data.map((item) => {
              if(item.event_start_time >= this.state.event_start_date_unix && item.event_end_time <= this.state.event_end_date_unix){
                if(item.event_state === 'UP'){
                  return {
                    event_start_time: item.event_start_time,
                    event_end_time: item.event_end_time,
                    event_state: 1,
                  };
                }
                return {
                  event_start_time: item.event_start_time,
                  event_end_time: item.event_end_time,
                  event_state: -1,
                };
              }
              return null;
            })
          }
          ud
        >
          <Line 
            dataKey='event_state' 
            baseLine={-10}
            type='step'
            stroke="url(#splitColor)"
          />
        </LineChartUD>
        </Paper>
        <Paper>
          <Typography className={classes.headerPadding} variant={'headline'}>Latency</Typography>
          <LineChartLatency 
            data={
              this.props.data.map((item) => {
                if(item.event_start_time >= this.state.event_start_date_unix && item.event_end_time <= this.state.event_end_date_unix){
                  if(item.device_rta === 0){
                    return {
                      event_start_time: item.event_start_time,
                      event_end_time: item.event_end_time,
                      device_ping: item.device_ping,
                    };
                  }
                  return {
                    event_start_time: item.event_start_time,
                    event_end_time: item.event_end_time,
                    device_ping: item.device_ping,
                    device_rta: item.device_rta,
                  };
                }
                return null;
              })
            }
          />
        </Paper>
      </div>
    );
  };
};

const mapStateToProps = state => {
  return {
    modules: state.network.modules,
    individualModule: state.network.individualModule,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    delModule: module => dispatch(delModule(module)),
    getStats: data => dispatch(getStats(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)( withRouter(withStyles(styles)( statistics )) );
