import React from 'react'
import { connect } from 'react-redux'
import { setRows } from '../actions'
import moment from 'moment'
import axios from 'axios'

const google = window.google

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { n: null, period: '' }
  }

  componentDidMount() {
    google.charts.load('current', { packages: ['corechart', 'line'] })
    google.charts.setOnLoadCallback(this.drawBackgroundColor)

    axios
      .get('/data.json')
      .then(d => {
        try {
          d = d.data.map(e => [e.value[0], e.value[4]])
          for (let i = 0, n = d.length; i < n; i++) {
            d[i][0] = new Date(d[i][0] * 1000)
          }
          this.props.setRows(d)
        } catch (e) {
          console.log(e)
        }
      })
      .catch(console.log)
  }

  drawBackgroundColor(rows) {
    if (!rows) return
    let data = new google.visualization.DataTable()
    data.addColumn('date', 'Date')
    data.addColumn('number', 'Price')
    data.addRows(rows)

    let options = {
      hAxis: {},
      vAxis: { format: '$# ###' },
      backgroundColor: '#f1f8e9'
    }

    let chart = new google.visualization.LineChart(document.getElementById('chart_div'))
    chart.draw(data, options)
  }

  setGraph(n) {
    if (n === this.state.n) return
    this.setState({ n }, () => {
      let rows = this.props.rows.slice(0)
      if (!rows.length) {
        this.setState({ period: '' }, () => {
          this.drawBackgroundColor([])
        })
        return
      }
      let lastItemDt = rows[rows.length - 1][0].getTime()
      if (n === 0) {
        let month = 30 * 24 * 60 * 60 * 1000
        rows = rows.filter(e => e[0].getTime() > lastItemDt - month)
      } else if (n === 1) {
        let quarter = 91 * 24 * 60 * 60 * 1000
        rows = rows.filter(e => e[0].getTime() > lastItemDt - quarter)
      }
      let period = `${moment(rows[0][0]).format('DD.MM.YYYY HH:mm')} - ${moment(rows[rows.length - 1][0]).format('DD.MM.YYYY HH:mm')}`
      this.setState({ period }, () => {
        this.drawBackgroundColor(rows)
      })
    })
  }

  render() {
    return (
      <React.Fragment>
        <h1>S&P 500</h1>
        <ul className="select-period">
          {['Month', 'Quarter', 'Max'].map((e, i) => (
            <li key={i}>
              <button className={this.state.n === i ? 'active' : ''} onClick={() => this.setGraph(i)} type="button">
                {e}
              </button>
            </li>
          ))}
        </ul>
        <div className="period">{this.state.period}</div>
        <div id="chart_div" />
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => state

const mapDispatchToProps = { setRows }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
