import xs from 'xstream';
import { div, h1, button, p, input, select, option } from '@cycle/dom';

export default function main(sources) {
  let people = [
    { first: 'Hans', last: 'Emil' },
    { first: 'Max', last: 'Mustermann' },
    { first: 'Roman', last: 'Tisch' },
  ];

  const first$ = sources.DOM.select('.first')
    .events('input')
    .map((ev) => ev.target.value)
    .startWith('');

  const last$ = sources.DOM.select('.last')
    .events('input')
    .map((ev) => ev.target.value)
    .startWith('');

  const search$ = sources.DOM.select('.search')
    .events('input')
    .map((ev) => ev.target.value)
    .startWith('');

  const select$ = sources.DOM.select('select')
    .events('change')
    .map((ev) => ev.target.value)
    .startWith(null);

  const create$ = sources.DOM.select('.btnCreate')
    .events('click')
    .map((ev) => {
      const first = document.querySelector('.first').value || '';
      const last = document.querySelector('.last').value || '';
      return { first, last };
    })
    .startWith({ first: '', last: '' });

  const delete$ = sources.DOM.select('.btnDelete')
    .events('click')
    .map((ev) => {
        return document.querySelector('select').selectedIndex || 0;
    })
    .startWith(null);


  const state$ = xs.combine(search$, create$, delete$)
    .map(([search, newName, deleteItem]) => {

      // create
      if (newName.first && newName.last) {
        people.push(newName);
      } else if(deleteItem) {
        people.splice(deleteItem, 1);
      }

      // filter
      let _people = people
        .filter(
          (p) =>
          p.first.toLowerCase().includes(search) ||
          p.last.toLowerCase().includes(search),
        );

      return _people;
    });

  const searchList$ = state$.map((state) => { 

    return div([
      p(input('.search', { attrs: { type: 'text' } })),
      p(
        select(
          { attrs: { size: 5 } },
          state
          .map((p) =>
            option(
              { attrs: { value: `${p.last}, ${p.first}` } },
              `${p.last}, ${p.first}`,
            ),
          ),
        ),
      ),
    ]);
  });

  /*
  create$.addListener({
    next: (value) => {
      console.log(value);
      const first$ = document.querySelector('.first');
      const first = first$ && first$.value;
      const last$ = document.querySelector('.last');
      const last = last$ && last$.value;
      if (first && last) {
        people.push({ first, last });
      }
    },
  });
  */

  const vdom$ = xs
    .combine(searchList$, select$)
    .map(([searchList, selected]) => {
      const [_first, _last] = selected && selected.split(',') || ['',''];
      return div([
        searchList,
        p(
          input('.first', {
            attrs: { type: 'text', value: _first },
          }),
        ),
        p(
          input('.last', {
            attrs: { type: 'text', value: _last },
          }),
        ),
        p([
          button('.btnCreate', { attrs: { type: 'button' } }, 'create'),
          button('.btnUpdate', { attrs: { type: 'button' } }, 'update'),
          button('.btnDelete', { attrs: { type: 'button' } }, 'delete'),
        ]),
      ]);
    });

  return {
    DOM: vdom$,
  };
}
