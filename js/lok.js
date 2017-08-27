var Lok = {};

formatDate = function(date) {
    return date.toISOString().substring(0,10);
}

addDays = function (date, days) {
    var v = date.valueOf();
    v += days * 24 * 60 * 60 * 1000;
    return new Date(v);
}

dayName = function(date) {
    return ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"][date.getDay()];
}

function saveParticipants(participants) {
    window.localStorage.setItem('participants', JSON.stringify(participants));
}
function loadParticipants() {
    return JSON.parse(window.localStorage.getItem('participants') || '[]');
}

function loadParticipation(date) {
    return JSON.parse(window.localStorage.getItem(date) || '[]');
}

function saveParticipation(date, participants) {
    window.localStorage.setItem(date, JSON.stringify(participants))
}

function Participant(name, viewModel){
    var self = this;
    this.name = name;
    this.status = ko.observable("N");
    this.toggle = function(){
        if (self.status() == "N") self.status("J");
        else self.status("N");
        viewModel.saveCurrentDay();
    }
}

function LokViewModel() {
    var self = this;
    self.currentDate = ko.observable(new Date());
    
    self.displayDate = ko.computed(function(){
        return formatDate(self.currentDate()) + " " +
            dayName(self.currentDate());
    });
    
    var participants = loadParticipants().map(function(name){
        return new Participant(name,self);
    });

    self.participants = ko.observableArray(participants);

    self.applyCurrentDay = function()
    {
        var selected = loadParticipation(self.displayDate());
        self.participants().forEach(function(p){
            if (selected.includes(p.name)) p.status("J");
            else p.status("N");
        })
    };
    self.applyCurrentDay();

    self.addParticipant = function(name) {
        self.participants.push(new Participant(name,self));
        saveParticipants(self.participants().map(function(p){
                return p.name;
            }));
    };

    self.saveCurrentDay = function(){
        saveParticipation(self.displayDate(), 
        self.participants().filter(function(p){
                return p.status() == "J";
            })
            .map(function(p){
                return p.name;
            }));
    };

    self.nextDay = function(){
        self.currentDate(addDays(self.currentDate(),1));
        self.applyCurrentDay();
    };

    self.previousDay = function(){
        self.currentDate(addDays(self.currentDate(),-1));
        self.applyCurrentDay();
    };

    self.popup = function(){
        var name = window.prompt("Namn på spelaren");
        self.addParticipant(name);
    }
}


var viewModel = new LokViewModel();

ko.applyBindings(viewModel);