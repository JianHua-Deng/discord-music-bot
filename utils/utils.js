
function inChannel(channel){
    if (!channel){
        return false;
    } 
    return true;

};

function validQueue(queue){
    if (!queue || !queue.isPlaying()){
        return false;
    }
    return true;
};

module.exports = {
    inChannel,
    validQueue,
};