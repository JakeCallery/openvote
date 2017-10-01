import EventDispatcher from 'jac/events/EventDispatcher';
import JacEvent from 'jac/events/JacEvent';
import l from 'jac/logger/Logger';

let instance = null;

export default class TopicsDataModel extends EventDispatcher {
    constructor(){
        super();
        if(!instance){
            this.topics = [];
            this.currentMaxVoteCount = 0;

            instance = this;
        }

        return instance
    }

    incVoteCount($topicId){
        let topic = this.getTopic($topicId);
        if(topic){
            l.debug('Topic Vote Count Before: ', topic.voteCount);
            topic.voteCount++;
            this.updateTopicCountPercentage(topic);
            l.debug('Topic Vote Count After: ', topic.voteCount);
            this.notifyOfUpdate();
        } else {
            l.error('Could not find local topic: ', $topicId);
        }

    }

    getTopic($topicId){
        for(let i = 0; i < this.topics.length; i++){
            if(this.topics[i].topicId === $topicId){
                return this.topics[i];
            }
        }

        return null;
    }

    updateTopics($topics){
        this.topics = $topics;

        //Sort data
        this.topics.sort(($a, $b) => {
            if(parseInt($a.voteCount) < parseInt($b.voteCount)){
                return 1;
            } else if(parseInt($a.voteCount) > parseInt($b.voteCount)){
                return -1;
            } else {
                return 0;
            }
        });

        //Updated cached max value (for percentage calcs later)
        this.currentMaxVoteCount = this.topics[0].voteCount;

        //Update percentages
        for(let i = 0; i < this.topics.length; i++){
            let topic = this.topics[i];
            this.updateTopicCountPercentage(topic);
        }

        //Let everyone know
        this.notifyOfUpdate();
    }

    updateTopicCountPercentage($topic){
        $topic.countPercent = Math.round(($topic.voteCount / this.currentMaxVoteCount) * 100);
    }

    notifyOfUpdate(){
        this.dispatchEvent(new JacEvent('updatedTopics', this.topics));
    }
}