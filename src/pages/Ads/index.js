import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";

import useApi from "../../helpers/OlxAPI";

import { PageContainer } from "../../components/MainComponents";
import AdItem from "../../components/partials/AdItem";

import { PageArea } from "./styled";

let timer;

const Page = () => {
  const api = useApi();
  const history = useHistory();

  const useQueryString = () => {
    return new URLSearchParams(useLocation().search);
  };

  const query = useQueryString();

  const [q, setQ] = useState(query.get("q") != null ? query.get("q") : "");
  const [cat, setCat] = useState(
    query.get("cat") != null ? query.get("cat") : ""
  );
  const [state, setState] = useState(
    query.get("state") != null ? query.get("state") : ""
  );

  const [adsTotal, setAdsTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [stateList, setStateList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [adList, setAdList] = useState([]);

  const [resultOpacity, setResultOpacity] = useState(1);
  const [loading, setLoading] = useState(true);

  const getAdsList = async () => {
    setLoading(true);

    let offset = (currentPage - 1) * 2;

    const json = await api.getAds({
      sort: "desc",
      limit: 2,
      q,
      cat,
      state,
      offset
    });

    setAdList(json.ads);
    setAdsTotal(json.total);
    setResultOpacity(1);
    setLoading(false);
  };

  useEffect(() => {
    if (adList.length > 0) {
      setPageCount(Math.ceil(adsTotal / adList.length));
    } else {
      setPageCount(0);
    }
  }, [adsTotal, adList]);

  useEffect(() => {
    setResultOpacity(0.3);
    getAdsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    let queryString = [];

    if (q) {
      queryString.push(`q=${q}`);
    }

    if (cat) {
      queryString.push(`cat=${cat}`);
    }

    if (state) {
      queryString.push(`state=${state}`);
    }

    history.replace({
      search: `?${queryString.join("&")}`
    });

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(getAdsList, 2000);
    setResultOpacity(0.3);
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cat, state, history]);

  useEffect(() => {
    const getStates = async () => {
      const slist = await api.getStates();

      setStateList(slist);
    };

    getStates();
  }, [api]);

  useEffect(() => {
    const getCategories = async () => {
      const cats = await api.getCategories();

      setCategories(cats);
    };

    getCategories();
  }, [api]);

  let pagination = [];

  for (let i = 1; i <= pageCount; i++) {
    pagination.push(i);
  }

  return (
    <PageContainer>
      <PageArea>
        <div className="leftSide">
          <form action="" method="get">
            <input
              value={q}
              type="text"
              name="q"
              placeholder="O que você procura?"
              onChange={e => setQ(e.target.value)}
            />

            <div className="filterName">Estado:</div>
            <select
              name="state"
              value={state}
              onChange={e => setState(e.target.value)}
            >
              <option></option>
              {stateList &&
                stateList.map((state, k) => (
                  <option value={state.name} key={k}>
                    {state.name}
                  </option>
                ))}
            </select>

            <div className="filterName">Categoria:</div>
            <ul>
              {categories &&
                categories.map((category, k) => (
                  <li
                    onClick={() => setCat(category.slug)}
                    key={k}
                    className={
                      cat === category.slug
                        ? "categoryItem active"
                        : "categoryItem"
                    }
                  >
                    <img src={category.img} alt="" />
                    <span>{category.name}</span>
                  </li>
                ))}
            </ul>
          </form>
        </div>
        <div className="rightSide">
          <h2>Resultados</h2>

          {loading && adList.length === 0 && (
            <div className="listWarning">Carregando...</div>
          )}
          {!loading && adList.length === 0 && (
            <div className="listWarning">Nenhum resultado foi encontrado.</div>
          )}

          <div className="list" style={{ opacity: resultOpacity }}>
            {adList.map((list, k) => (
              <AdItem key={k} data={list} />
            ))}
          </div>

          <div className="pagination">
            {pagination.map((i, k) => (
              <div
                key={k}
                onClick={() => setCurrentPage(i)}
                className={i === currentPage ? "pagItem active" : "pagItem"}
              >
                {i}
              </div>
            ))}
          </div>
        </div>
      </PageArea>
    </PageContainer>
  );
};

export default Page;
