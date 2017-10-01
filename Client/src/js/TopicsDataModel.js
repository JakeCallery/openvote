import EventDispatcher from 'jac/events/EventDispatcher';
import JacEvent from 'jac/events/JacEvent';
import l from 'jac/logger/Logger';

let instance = null;

export default class TopicsDataModel extends EventDispatcher {
    constructor(){
        super();
        if(!instance){
            this.topics = [];
            this._currentMaxVoteCount = 0;

            instance = this;
        }

        return instance
    }

    get currentMaxVoteCount(){
        return this._currentMaxVoteCount
    }
    set currentMaxVoteCount($newCount){
        this._currentMaxVoteCount = $newCount;
        this.recalcAllPercents();
        this.notifyOfUpdate();
    }

    incVoteCount($topicId){
        let topic = this.getTopic($topicId);
        if(topic){
            topic.voteCount++;

            if(topic.voteCount > this.currentMaxVoteCount)
            {
                this.currentMaxVoteCount = topic.voteCount;
            }

            this.updateTopicCountPercentage(topic);
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
            this.updateTopicCountPercentage(topic, false);
        }

        //Let everyone know
        this.notifyOfUpdate();
    }

    updateTopicCountPercentage($topic, $optSkipNotify){
        $topic.countPercent = Math.round(($topic.voteCount / this.currentMaxVoteCount) * 100);

        if(!$optSkipNotify){
            this.notifyOfUpdate();
        }

    }

    recalcAllPercents(){
        for(let i = 0; i < this.topics.length; i++){
            let topic = this.topics[i];
            topic.countPercent = Math.round((topic.voteCount / this.currentMaxVoteCount) * 100);
        }
        this.notifyOfUpdate();
    }

    notifyOfUpdate(){
        this.dispatchEvent(new JacEvent('updatedTopics', this.topics));
    }
}