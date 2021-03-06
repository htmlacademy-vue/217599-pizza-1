import {
  SET_USER,
  TOGGLE_IS_AUTH,
} from "src/store/modules/auth/mutation-types";
import { JWT } from "@/services";

const initialState = () => ({
  isAuth: false,
  user: undefined,
});

const UNAUTHORIZED = 401;

export default {
  namespaced: true,

  state: initialState(),

  mutations: {
    [TOGGLE_IS_AUTH](state, isAuth) {
      state.isAuth = isAuth;
    },

    [SET_USER](state, currentUser) {
      state.user = currentUser;
    },
  },

  actions: {
    async checkAuth({ dispatch }) {
      if (JWT.getToken()) {
        this.$api.auth.setAuthHeader();
        dispatch("getMe");
        dispatch("toggleIsAuth", true);
      }
    },

    async login({ dispatch }, body) {
      try {
        const { token } = await this.$api.auth.login(body);

        JWT.saveToken(token);
        this.$api.auth.setAuthHeader();
        dispatch("toggleIsAuth", true);
        dispatch("getMe");
      } catch (e) {
        return Promise.reject(e);
      }
    },

    async logout({ dispatch, commit }) {
      try {
        await this.$api.auth.logout();
        JWT.destroyToken();
        this.$api.auth.setAuthHeader();
        dispatch("toggleIsAuth", false);
        commit(SET_USER, undefined);
      } catch (e) {
        return Promise.reject(e);
      }
    },

    async toggleIsAuth({ commit }, isAuth) {
      commit(TOGGLE_IS_AUTH, isAuth);
    },

    async getMe({ commit, dispatch }) {
      try {
        const currentUser = await this.$api.auth.getMe();

        commit(SET_USER, currentUser);
      } catch (e) {
        const { status } = e;

        if (status === UNAUTHORIZED) {
          JWT.destroyToken();
          this.$api.auth.setAuthHeader();
          dispatch("toggleIsAuth", false);
          commit(SET_USER, undefined);
        }
      }
    },
  },
};
