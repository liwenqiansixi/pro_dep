const TagviewModel = {
  namespace: 'tagView',
  state: {
    visitedViews: [],
    cachedViews: [],
    activeTagKey: ""
  },
  effects: {
    * doAddView({
      payload
    }, {
      call,
      put
    }) {
      yield put({
        type: "addVisitedView",
        payload
      });
      return true;
    }
  },
  reducers: {
    setActiveTagKey(state, {
      payload
    }) {
      return {
        ...state,
        activeTagKey: payload
      }
    },
    addVisitedView(state, {
      payload
    }) {
      if (state.visitedViews.some(v => v.path === payload.path)) return state
      const {
        visitedViews
      } = state
      visitedViews.push({
        ...payload,
        title: payload.meta.title || 'no-name'
      })
      return {
        ...state,
        visitedViews
      }
    },
    addCachedView(state, {
      payload
    }) {
      if (state.cachedViews.includes(payload.name)) return state
      if (!payload.meta.noCache) {
        state.cachedViews.push(payload.name)
      }
      return {
        ...state
      }
    },

    delVisitedView(state, {
      payload
    }) {
      const {
        visitedViews
      } = state
      visitedViews.forEach((item, index) => {
        if (item.path === payload) {
          return visitedViews.splice(index, 1)
        }
      })
      return {
        ...state,
        visitedViews
      }
    },
    delCachedView(state, {
      payload
    }) {
      const index = state.cachedViews.indexOf(payload.name)
      index > -1 && state.cachedViews.splice(index, 1)
    },

    /*  delOthersVisitedViews(state, {
       payload
     }) {
       state.visitedViews = state.visitedViews.filter(v => {
         return v.meta.affix || v.path === payload.path
       })
     },
     delOthersCachedViews(state, {
       payload
     }) {
       const index = state.cachedViews.indexOf(payload.name)
       if (index > -1) {
         state.cachedViews = state.cachedViews.slice(index, index + 1)
       } else {
         state.cachedViews = []
       }
     },

     delAllVisitedViews(state, {
       payload
     }) {
       // keep affix tags
       const affixTags = state.visitedViews.filter(tag => tag.meta.affix)
       state.visitedViews = affixTags
     },

     delAllCachedViews(state, {
       payload
     }) {
       state.cachedViews = []
     },

     updateVisitedView(state, {
       payload
     }) {
       for (let v of state.visitedViews) {
         if (v.path === payload.path) {
           v = Object.assign(v, payload)
           break
         }
       }
     } */
  }
};
export default TagviewModel;
