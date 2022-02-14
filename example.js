<script type="text/javascript">
function difference(date1, date2) {  
  const date1utc = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const date2utc = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    day = 1000*60*60*24;
  return(date2utc - date1utc)/day
}

  

timetoclose='';
if (document.getElementById('created-val')) {
  if (document.getElementById('resolutiondate-val')) {
  resolutiondate=document.getElementById('resolutiondate-val').children[0].attributes[1].value;
  createdate=document.getElementById('created-val').children[0].attributes[1].value;
  createdate1 = new Date(createdate);
  resolvedate1 = new Date(resolutiondate);
  timetoclose = document.getElementById('customfield_10201') ;
  if(timetoclose) {
  time_difference = difference(createdate1,resolvedate1);
  timetoclose.value=time_difference;
}

  } else {
    if(timetoclose) {
    timetoclose.style.display='none';
  }
  }
}
 </script>
