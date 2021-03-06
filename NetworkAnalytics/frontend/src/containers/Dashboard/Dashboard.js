import React, { Component } from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';

import { Route, Link, withRouter, Switch } from 'react-router-dom';

import Statistics from '../Statistics/Statistics';

import MainDashboard from '../../components/MainDashboard/MainDashboard';
import Modal from '../../components/Modal/Modal';

import { connect } from 'react-redux';
import { getModules } from '../../store/actions/index';

const styles = theme => ({
  progress: {
      margin: theme.spacing.unit * 2,
    }
});

class dashboard extends Component {
  constructor (props) {
    super(props);
    this.state = {
      value: 0,
    };
  };

  handleChange = (event, value) => {
    this.setState({value});
  };

  renderLink = itemProps => <Link to={this.itemProps.to} />;

  render () {
    const { classes } = this.props;
    const statModules = this.props.individualModule.map((item, index) => {
      return (
        <Route 
          key={item.device_name} 
          path={ `/dashboard/` + item.device_name} 
          render={() => <Statistics 
            id={item.device_name}
            data={item.device_data}
            itemData={item}
          /> 
          } 
          sensitive={true}
        />
      );
    });

    if(this.props.loader && !this.props.err){
      return <CircularProgress className={classes.progress} size={50} />;
    }
    return (
      <div>
          <Switch>
            <Route 
              path='/dashboard/'
              component={MainDashboard}
              exact
            />
            {statModules}
          </Switch>
          {this.props.err && <Modal />}
      </div>
    );
  };
};

const mapStateToProps = state => {
  return {
    loader: state.network.loader,
    modules: state.network.modules,
    individualModule: state.network.individualModule,
    err: state.network.err,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getModules: () => dispatch(getModules())
  };
};

export default withRouter( connect(mapStateToProps, mapDispatchToProps)( withStyles(styles)(dashboard)) );
