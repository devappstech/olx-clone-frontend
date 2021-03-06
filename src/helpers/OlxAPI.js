import Cookies from "js-cookie";
import qs from "qs";

const BASEAPI = "http://alunos.b7web.com.br:501";

const OlxAPI = {
  login: async (email, password) => {
    const response = await apiFetchPost("/user/signin", { email, password });

    return response;
  },

  register: async (name, email, password, stateLocal) => {
    const response = await apiFetchPost("/user/signup", {
      name,
      email,
      password,
      state: stateLocal
    });

    return response;
  },

  getStates: async () => {
    const response = await apiFetchGet("/states");

    return response.states;
  },

  getCategories: async () => {
    const response = await apiFetchGet("/categories");

    return response.categories;
  },

  getAds: async options => {
    const response = await apiFetchGet("/ad/list", options);

    return response;
  },

  getAd: async (id, otherAds = false) => {
    const response = await apiFetchGet(`/ad/item`, {
      id,
      other: otherAds
    });

    return response;
  },

  addAd: async fData => {
    const response = await apiFetchFile(`/ad/add`, fData);

    return response;
  },

  getUserData: async () => {
    const response = await apiFetchGet(`/user/me`);

    return response;
  },

  edit: async (name, email, password, stateLocal) => {
    const json = await apiFetchGet(`/user/me`);

    if (name === json.name) {
      name = null;
    }

    if (email === json.email) {
      email = null;
    }

    if (stateLocal === json.state) {
      stateLocal = null;
    }

    const response = await apiFetchPut(`/user/me`, {
      name,
      email,
      password,
      state: stateLocal
    });

    return response;
  }
};

const apiFetchFile = async (endpoint, body) => {
  if (!body.token) {
    let token = Cookies.get("token");

    if (token) {
      body.append("token", token);
    }
  }

  const res = await fetch(`${BASEAPI}${endpoint}`, {
    method: "POST",
    body
  });

  const json = await res.json();

  if (json.notallowed) {
    window.location.href = "/signin";
    return;
  }

  return json;
};

const apiFetchPost = async (endpoint, body) => {
  if (!body.token) {
    let token = Cookies.get("token");

    if (token) {
      body.token = token;
    }
  }

  const res = await fetch(`${BASEAPI}${endpoint}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const json = await res.json();

  // if (json.notallowed) {
  //   window.location.href = "/signin";
  //   return;
  // }

  return json;
};

const apiFetchGet = async (endpoint, body = []) => {
  if (!body.token) {
    let token = Cookies.get("token");

    if (token) {
      body.token = token;
    }
  }

  const res = await fetch(`${BASEAPI}${endpoint}?${qs.stringify(body)}`);

  const json = await res.json();

  if (json.notallowed) {
    window.location.href = "/signin";
    return;
  }

  return json;
};

const apiFetchPut = async (endpoint, body) => {
  if (!body.token) {
    let token = Cookies.get("token");

    if (token) {
      body.token = token;
    }
  }

  const res = await fetch(`${BASEAPI}${endpoint}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const json = await res.json();

  // if (json.notallowed) {
  //   window.location.href = "/signin";
  //   return;
  // }

  return json;
};

export default () => OlxAPI;
