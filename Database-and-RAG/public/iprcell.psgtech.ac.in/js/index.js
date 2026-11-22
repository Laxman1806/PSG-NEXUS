fetch("../json/announcements.json").
then((response) => response.json()).
then((data) => displayAnnouncements(data)).
catch(e => {document.getElementById("error").innerHTML="ERROR IN LOADING THE FILE";});

function displayAnnouncements(data)
{
    var mainContent = document.getElementById("announcements");

    for (var i=0; i<data.length;i++)
    {
        var divContent = document.createElement('div');
        divContent.className="divContent";

        var addContent = "<p>" + data[i] +"</p>";
        
        divContent.innerHTML = addContent;
        mainContent.appendChild(divContent);
    }
}