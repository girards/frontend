import axios from 'libs/axios';
import fetch_helpers from 'libs/fetch_helpers';
import { trackVoiceUsage } from 'libs/analytics';

export const results_fetched = results => {
  return {
    type: 'RESULTS_FETCHED',
    payload: results,
  };
};

export const tagsOptionsFetched = tags => {
  return {
    type: 'TAGS_FETCHED',
    payload: tags,
  };
};

export const results_fetch_started = () => {
  return {
    type: 'RESULTS_FETCH_STARTED',
  };
};

export const search_query_updated = search_query => {
  return {
    type: 'SEARCH_QUERY_UPDATED',
    payload: search_query,
  };
};

export const toggle_tag_from_search_query = (current_search_query, item_tag, history) => {
  return dispatch => {
    let search_params = current_search_query;
    if (current_search_query.tags.length) {
      // if tags present in url
      let selected_tags_array = current_search_query.tags.splice('+');
      // eslint-disable-next-line
      let tags_str = '';
      if (selected_tags_array.includes(item_tag)) {
        // if tag already present, remove it
        let new_arr = selected_tags_array.filter(tag => tag !== item_tag);
        selected_tags_array = new_arr;
        tags_str = new_arr.join('+');
      } else {
        // if tag was not present, add it
        selected_tags_array.push(item_tag);
        tags_str = selected_tags_array.join('+');
      }
      search_params.tags = selected_tags_array;
    } else {
      // If No tags yet
      if (item_tag) {
        search_params.tags.push(item_tag);
      }
    }
    dispatch(update_path(search_params, history));
    // will trigger update_search_query from results_container
  };
};

export const update_path = (search_params, history) => {
  return dispatch => {
    const query_string = composeQuery(search_params);
    history.push('/results?' + query_string);
    // will trigger update_search_query from results_container
  };
};

const composeQuery = search_params => {
  const query_params = {
    serviceTypes: !search_params.type.length ? undefined : search_params.type.join('+'),
    start_date: search_params.start_date || undefined,
    end_date: search_params.end_date || undefined,
    person_nb: search_params.person_nb || undefined,
    latitude: search_params.latitude || undefined,
    longitude: search_params.longitude || undefined,
    address: search_params.address || undefined,
    tags: !search_params.tags.length ? undefined : search_params.tags.join('+'),
    onlySmartContracts: search_params.onlySmartContracts || undefined,
    page: search_params.page || 1,
    limit: search_params.limit || 10,
    sortBy: search_params.sortBy || undefined,
    radiusInKm: search_params.radiusInKm || 10,
  };
  let query_arr = [];
  Object.entries(query_params).forEach(([key, value]) => {
    if (value) {
      let to_concat = key + '=' + value;
      query_arr = query_arr.concat(to_concat);
    }
  });
  const query_string = query_arr.join('&');
  return query_string;
};

export const composeFetchQuery = search_params => {
  const query_params = {
    category: !search_params.type.length
      ? undefined
      : search_params.type.map(a => a.charAt(0).toUpperCase() + a.substr(1)).join('+'),
    startDate: search_params.start_date || undefined,
    endDate: search_params.end_date || undefined,
    guestNb: search_params.person_nb || undefined,
    lat: search_params.latitude || undefined,
    lng: search_params.longitude || undefined,
    address: search_params.address || undefined,
    tags: !search_params.tags.length ? undefined : search_params.tags.join(','),
    onlySmartContracts: search_params.onlySmartContracts || undefined,
    page: search_params.page || 1,
    limit: search_params.limit || 1,
    text: search_params.text || undefined,
    sortBy: search_params.sortBy || undefined,
    radiusInKm: search_params.radiusInKm || 10,
  };
  let query_arr = [];
  Object.entries(query_params).forEach(([key, value]) => {
    if (value) {
      let to_concat = key + '=' + value;
      query_arr = query_arr.concat(to_concat);
    }
  });
  const query_string = query_arr.join('&');
  return query_string;
};

/* called from componentWillUpdate of results_container */
/* is triggered whenever serviceTypes or tags props have changed */
export const update_search_query = search_params => {
  return dispatch => {
    dispatch(search_query_updated({ search_query: search_params }));
    dispatch(fetch_results(search_params));
    dispatch(results_fetch_started());
  };
};

export const update_search_query_without_search = search_params => {
  return dispatch => {
    dispatch(
      search_query_updated({
        search_query: search_params,
      }),
    );
  };
};

export const fetch_results = results_search_query => {
  return async dispatch => {
    try {
      const query = composeFetchQuery(results_search_query);
      const searchPath = query ? '?' + query : '';
      const pathPrefix = results_search_query.type.includes('trip')
        ? '/search'
        : '/search/services';
      const results = await axios.get(pathPrefix + searchPath).catch(error => {
        console.log(error);
      });
      if (results) {
        const resultsArr = results.data.trips || results.data.services;
        const data = fetch_helpers.buildServicesJson(resultsArr);
        const resultsData = { results: data };
        dispatch(results_fetched(resultsData));
        results_search_query['resultsCount'] = results.data.count;
        dispatch(search_query_updated({ search_query: results_search_query }));
        const tagsOptions = results.data.tags.map(tag => {
          return tag.names['en-us'].charAt(0).toUpperCase() + tag.names['en-us'].substr(1);
        });
        const tags = tagsOptions.map(item => {
          return { text: item, value: item };
        });
        dispatch(tagsOptionsFetched(tags));
      }
    } catch (e) {
      console.log(e);
    }
  };
};

export const fetchTagsOptions = () => {
  return async dispatch => {
    try {
      const tags = await axios.get('/tags');
      if (tags) {
        const tagsOptions = tags.data.map(tag => {
          return tag.names['en-us'].charAt(0).toUpperCase() + tag.names['en-us'].substr(1);
        });
        const uniqTagItems = [...new Set(tagsOptions)];
        const uniqTagsOptions = uniqTagItems.map(item => {
          return { text: item, value: item };
        });
        dispatch(tagsOptionsFetched(uniqTagsOptions));
      }
    } catch (error) {
      console.log(error);
    }
  };
};

export const voiceQuery = results => dispatch => {
  dispatch({ type: 'analytics', meta: { analytics: trackVoiceUsage(results) } });
};
