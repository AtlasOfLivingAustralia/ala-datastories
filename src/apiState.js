
import { reactive } from 'vue'

export const apiState = reactive({
  query: "*",
  filters: [],
  filterState: {},
  filterStore: {},

  setFilter(filter) {
    // filter obj {field, fieldLabel, value, valueLabel, fq}
    if (this.filterState[filter.field] && this.filterState[filter.field].value == filter.value ){
      delete this.filterState[filter.field] // toggle off
    } else {
      this.filterState[filter.field] = filter;
      // delete species focus if we've switched lifeform groups
      if (filter.field == "speciesGroup" && this.filterState.lsid) delete this.filterState.lsid;
    }
    this.filters = Object.keys(this.filterState).map(k => this.filterState[k])
    this.setQuery();

  },

  removeFilter(filter){
    delete this.filterState[filter.field] // toggle off
    this.filters = Object.keys(this.filterState).map(k => this.filterState[k])
    this.setQuery();
  },

  clearFilter(){
    this.filterState = {};
    this.filters = [];
    this.setQuery();
  },

  getFilterValue(field){
    if (this.filterState && this.filterState[field]) return this.filterState[field].value;
    return null;
  },

  setQuery(){
    const joinedQuery = Object.keys(this.filterState)
      .map(k => this.filterState[k].fq)
      .join(" AND "); // boolean query
    let q = "*";
    if (joinedQuery) q = "* AND " + joinedQuery;
    this.query = q;
  },

  switchFilter(fromview, toview){
    this.filterStore[fromview] = this.filterState;
    if (this.filterStore[toview]){
      this.filterState = this.filterStore[toview];
      this.filters = Object.keys(this.filterState).map(k => this.filterState[k])
      this.setQuery()
    } else {
      this.clearFilter();
    }
  }

})