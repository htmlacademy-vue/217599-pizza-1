import {
  SET_SAUCES,
  SAUCE_CHANGE,
  RESET_STATE,
} from "@/modules/builder/store/builder-sauce/mutation-types";
import { getChecked } from "@/common/helpers";
import { CacheController } from "@/modules/builder/helpers";
import { normalize } from "@/modules/builder/store/builder-sauce/helpers";

const cacheController = new CacheController();

const initialState = () => ({
  sauces: cacheController.items,
});

export default {
  namespaced: true,

  state: initialState(),

  getters: {
    totalPrice(state) {
      return getChecked(state.sauces).price;
    },
  },

  mutations: {
    // eslint-disable-next-line no-unused-vars
    [RESET_STATE](state) {
      state = Object.assign(state, initialState());
    },

    [SET_SAUCES](state, payload) {
      state.sauces = payload;
    },
    [SAUCE_CHANGE](state, id) {
      state.sauces = state.sauces.map((sauce) => ({
        ...sauce,
        isChecked: sauce.id === id,
      }));
    },
  },

  actions: {
    resetState({ commit }) {
      commit(RESET_STATE);
    },

    async fetchSauces({ commit }, { cache } = { cache: true }) {
      await cacheController.run({
        api: () => this.$api.sauces.get(),
        normalize,
        cache,
      });

      commit(SET_SAUCES, cacheController.items);
    },

    setSauces({ commit }, sauces) {
      commit(SET_SAUCES, sauces);
    },

    sauceChange({ commit }, activeSauceId) {
      commit(SAUCE_CHANGE, activeSauceId);
    },
  },
};
