import {useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {createRootRoute,createRouter,RouterProvider,stripSearchParams,useNavigate} from '@tanstack/react-router';
import {calm,poke,setAuto,setLayout} from './runway.js';

type Layout='line'|'arc';
type RunwaySearch={layout:Layout;auto:boolean};
const DEFAULTS:RunwaySearch={layout:'line',auto:true};

// ?layout=arc and ?auto=false pick the view (the older ?auto=0 still works); defaults stay out of the URL
const Route=createRootRoute({
  validateSearch:(s:Record<string,unknown>):RunwaySearch=>({
    layout:s.layout==='arc'?'arc':'line',
    auto:!(s.auto===false||s.auto===0||s.auto==='0'||s.auto==='false'),
  }),
  search:{middlewares:[stripSearchParams(DEFAULTS)]},
  component:Controls,
});

function Controls(){
  const {layout,auto}=Route.useSearch();
  const navigate=useNavigate();
  const playing=auto&&!calm;
  useEffect(()=>setLayout(layout),[layout]);
  useEffect(()=>setAuto(playing),[playing]);
  const set=(next:Partial<RunwaySearch>)=>{poke();navigate({to:'.',search:prev=>({...prev,...next}),replace:true})};
  return <>
    <button aria-pressed={layout==='line'} onClick={()=>set({layout:'line'})}>Line</button>
    <button aria-pressed={layout==='arc'} onClick={()=>set({layout:'arc'})}>Arc</button>
    <i/>
    <button aria-pressed={playing} disabled={calm} onClick={()=>set({auto:!auto})}>Auto</button>
  </>;
}

const router=createRouter({routeTree:Route});
declare module '@tanstack/react-router'{interface Register{router:typeof router}}

createRoot(document.getElementById('ctl')!).render(<RouterProvider router={router}/>);
